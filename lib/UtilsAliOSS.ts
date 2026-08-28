import path from "path";
import { glob } from "glob";
import OSS from "ali-oss";

/**
 * Utility functions for ali-oss
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

/**
 * Creates an Aliyun OSS client for one bucket and region.
 *
 * @category Aliyun OSS
 * @param payload - The access credentials and bucket location.
 * @returns A configured Aliyun OSS client.
 *
 * @example
 * const client = getClientFromAliOSS({
 *   accessKeyId: process.env.ALI_ACCESS_KEY_ID ?? "",
 *   accessKeySecret: process.env.ALI_ACCESS_KEY_SECRET ?? "",
 *   bucket: "example-bucket",
 *   region: "oss-cn-hangzhou",
 * });
 */
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
 * Gets the URL for an object stored in Aliyun OSS.
 *
 * @category Aliyun OSS
 * @param payload - The client, object key, and optional base URL.
 * @returns The object URL returned by the OSS client.
 */
export function getObjectUrlFromAliOSS(
  payload: ParamsAliOSSGetObjectUrl,
): string {
  const { client, key, baseUrl } = payload;
  return client.getObjectUrl(key, baseUrl);
}

/**
 * Lists objects under an Aliyun OSS prefix.
 *
 * @category Aliyun OSS
 * @remarks Pass `maxKeys: 0` to keep requesting pages until the prefix is
 * exhausted.
 * @param payload - The client, prefix, page limit, and optional request settings.
 * @returns All object metadata returned for the prefix.
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
 * Deletes objects selected by remote path prefixes.
 *
 * @category Aliyun OSS
 * @param payload - The client and remote paths to remove.
 * @returns The keys reported as successfully deleted and those that failed.
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
 * Uploads one local file to Aliyun OSS.
 *
 * @category Aliyun OSS
 * @remarks The helper sets public-read and inline-content headers unless the
 * supplied request configuration overrides them.
 * @param payload - The client, local file, remote object path, and upload options.
 * @returns The stored object name plus its origin and CDN URLs.
 *
 * @example
 * const result = await uploadLocalFileToAliOSS({
 *   client,
 *   localPath: "./dist/app.js",
 *   remotePath: "assets/app.js",
 * });
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
 * Uploads the files in a local directory to Aliyun OSS.
 *
 * @category Aliyun OSS
 * @param payload - The client, source directory, ignore list, and recursion setting.
 * @returns Details for every uploaded object.
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
