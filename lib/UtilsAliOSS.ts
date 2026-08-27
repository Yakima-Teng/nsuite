import path from "path";
import { glob } from "glob";
import OSS from "ali-oss";

/**
 * Utility functions for ali-oss
 * @module OSS-Ali
 */

/**
 * Get Ali OSS client
 */
export type AliOSSClient = OSS;

export interface ParamsAliOSSConstructor {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
}

export interface ParamsAliOSSGetObjectUrl {
  client: AliOSSClient;
  key: string;
  baseUrl?: string;
}

export interface ParamsAliOSSListFiles {
  client: AliOSSClient;
  prefix: string;
  maxKeys?: number;
  options?: OSS.RequestOptions;
}

export interface ParamsAliDeleteRemotePathList {
  client: AliOSSClient;
  remotePathList: string[];
}

export interface ReturnAliDeleteRemotePathList {
  successItems: string[];
  failItems: string[];
}

export interface ParamsUploadLocalFile {
  client: AliOSSClient;
  localPath: string;
  remotePath: string;
  baseUrl?: string;
  config?: OSS.PutObjectOptions;
}

export interface ReturnUploadLocalFile {
  name: string;
  url: string;
  cdnUrl: string;
}

export interface ParamsUploadDirToAliOSS {
  client: AliOSSClient;
  localPath: string;
  ignorePathList: string[];
  recursive?: boolean;
}

export function getClientFromAliOSS(
  payload: ParamsAliOSSConstructor,
): AliOSSClient {
  const { accessKeyId, accessKeySecret, bucket, region } = payload;
  return new OSS({
    accessKeyId,
    accessKeySecret,
    bucket,
    region,
  });
}

/**
 * Get object url
 */
export function getObjectUrlFromAliOSS(
  payload: ParamsAliOSSGetObjectUrl,
): string {
  const { client, key, baseUrl } = payload;
  return client.getObjectUrl(key, baseUrl);
}

/**
 * List files
 */
export async function listFilesFromAliOSS(
  payload: ParamsAliOSSListFiles,
): Promise<OSS.ObjectMeta[]> {
  const { client, prefix, maxKeys = 100, options } = payload;
  let resultObjects: OSS.ObjectMeta[] = [];
  let continuationToken = "";
  do {
    const data = await client.listV2(
      {
        prefix,
        "max-keys": String(!maxKeys ? 1000 : maxKeys),
      },
      {
        timeout: 30000,
        ...(options || {}),
      },
    );
    if (data.objects) {
      resultObjects = resultObjects.concat(data.objects);
    }
    continuationToken = data.nextContinuationToken || "";
  } while (continuationToken && !maxKeys);

  return resultObjects;
}

/**
 * Delete files
 */
export async function deleteRemotePathListFromAliOSS(
  payload: ParamsAliDeleteRemotePathList,
): Promise<ReturnAliDeleteRemotePathList> {
  const { client, remotePathList } = payload;
  const successItems: string[] = [];
  const failItems: string[] = [];
  if (remotePathList.length === 0) {
    return {
      successItems: [],
      failItems: [],
    };
  }

  // 有目录需要清空的话，清空对应目录下的文件
  for (const prefix of remotePathList) {
    const fileList = await listFilesFromAliOSS({
      client,
      prefix,
      maxKeys: 0,
    });
    const keysToDelete = fileList.map((item) => item.name);
    const result = await client.deleteMulti(remotePathList);
    const rawDeleted = result.deleted || [];
    const deletedKeys = rawDeleted.map((item) => item.key);
    keysToDelete.forEach((key) => {
      if (deletedKeys.includes(key)) {
        successItems.push(key);
      } else {
        failItems.push(key);
      }
    });
  }

  return {
    successItems,
    failItems,
  };
}

/**
 * Upload local file to aliyun oss
 */
export async function uploadLocalFileToAliOSS(
  payload: ParamsUploadLocalFile,
): Promise<ReturnUploadLocalFile> {
  const { client, localPath, remotePath, baseUrl, config = {} } = payload;
  // 自定义请求头
  const headers = {
    // 指定Object的存储类型。
    "x-oss-storage-class": "Standard",
    // 指定Object的访问权限。
    "x-oss-object-acl": "public-read",
    // 通过文件URL访问文件时，指定以附件形式下载文件，下载后的文件名称定义为example.txt。
    // 'Content-Disposition': `attachment; filename="${filePathAndName.split('/').reverse()[0]}"`,
    // 不以附件形式下载，直接访问
    "Content-Disposition": "inline",
    // 设置Object的标签，可同时设置多个标签。
    "x-oss-tagging": "Tag1=1&Tag2=2",
    // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
    "x-oss-forbid-overwrite": "false",
    ...(config?.headers || {}),
  };
  const result = await client.put(
    remotePath,
    localPath,
    // 自定义headers
    {
      ...config,
      headers,
    },
  );

  const name = result.name;
  const cdnUrl = getObjectUrlFromAliOSS({
    client,
    key: name,
    baseUrl,
  });
  return {
    name,
    url: result.url,
    cdnUrl,
  };
}

/**
 * Normalize path
 *
 * @ignore
 */
const normalizePath = (filePath: string): string => {
  return filePath.replace(/\\/g, "/");
};

/**
 * Upload directory to aliyun oss
 */
export async function uploadDirToAliOSS(
  payload: ParamsUploadDirToAliOSS,
): Promise<ReturnUploadLocalFile[]> {
  const { client, localPath, ignorePathList, recursive = false } = payload;
  const globPath = recursive
    ? path.resolve(localPath, "**/*")
    : path.resolve(localPath, "*");
  const globConfig = {
    windowsPathsNoEscape: true,
    // only want the files, not the dirs
    nodir: true,
    ignore: Array.from(new Set(["node_modules", ...(ignorePathList || [])])),
  };
  const allFiles = await glob(globPath, globConfig);
  const rootPath = `${normalizePath(path.resolve(localPath))}/`;
  const allPaths = allFiles.map((filePath) => {
    return {
      localPath: normalizePath(filePath),
      remotePath: normalizePath(filePath).replace(rootPath, ""),
    };
  });
  return await Promise.all(
    allPaths.map(({ localPath, remotePath }) => {
      return uploadLocalFileToAliOSS({
        client,
        localPath,
        remotePath,
      });
    }),
  );
}
