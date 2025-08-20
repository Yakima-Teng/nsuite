import path from "path";
import { glob } from "glob";
import OSS from "ali-oss";

/**
 * @typedef {import('ali-oss')} AliOSSClient
 */

/**
 * @typedef {Object} ParamsAliOSSConstructor
 * @property {string} accessKeyId
 * @property {string} accessKeySecret
 * @property {string} bucket
 * @property {string} region
 */

/**
 * Get Ali OSS client
 * @param {ParamsAliOSSConstructor} payload
 * @returns {AliOSSClient}
 */
export const getClientFromAliOSS = (payload) => {
  const { accessKeyId, accessKeySecret, bucket, region } = payload;
  return new OSS({
    accessKeyId,
    accessKeySecret,
    bucket,
    region,
  });
};

/**
 * @typedef {Object} ParamsAliOSSGetObjectUrl
 * @property {AliOSSClient} client
 * @property {string} key
 * @property {string} [baseUrl] 一般为CDN加速域名，以http(s)开头
 */

/**
 * Get object url
 * @param {ParamsAliOSSGetObjectUrl} payload
 * @returns {string}
 */
export const getObjectUrlFromAliOSS = (payload) => {
  const { client, key, baseUrl } = payload;
  return client.getObjectUrl(key, baseUrl);
};

/**
 * @typedef {import('ali-oss').RequestOptions} AliRequestOptions
 * @typedef {import('ali-oss').ObjectMeta} AliObjectMeta
 */

/**
 * @typedef {Object} ParamsAliOSSListFiles
 * @property {AliOSSClient} client
 * @property {string} prefix
 * @property {number} [maxKeys = 100] max objects, default is 100, limit to 1000, set it to 0 or ignore it if you want to list all files
 * @property {AliRequestOptions} [options]
 */

/**
 * List files
 * @param {ParamsAliOSSListFiles} payload
 * @returns {Promise<AliObjectMeta[]>}
 */
export const listFilesFromAliOSS = async (payload) => {
  const { client, prefix, maxKeys = 100, options } = payload;
  /** @type {AliObjectMeta[]} */
  let resultObjects = [];
  /** @type {string | null} */
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
};

/**
 * @typedef {Object} ParamsAliDeleteRemotePathList
 * @property {AliOSSClient} client
 * @property {string[]} remotePathList
 */

/**
 * @typedef {Object} ReturnAliDeleteRemotePathList
 * @property {string[]} successItems
 * @property {string[]} failItems
 */

/**
 * Delete files
 * @param {ParamsAliDeleteRemotePathList} payload
 * @returns {Promise<ReturnAliDeleteRemotePathList>}
 */
export const deleteRemotePathListFromAliOSS = async (payload) => {
  const { client, remotePathList } = payload;
  /** @type {string[]} */
  const successItems = [];
  /** @type {string[]} */
  const failItems = [];
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
    /** @type {string[]} */
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
};

/**
 * @typedef {Object} ParamsUploadLocalFile
 * @property {AliOSSClient} client
 * @property {string} localPath
 * @property {string} remotePath
 * @property {string} [baseUrl]
 * @property {import('ali-oss').PutObjectOptions} [config]
 */

/**
 * @typedef {Object} ReturnUploadLocalFile
 * @property {string} name
 * @property {string} url
 * @property {string} cdnUrl
 */

/**
 * Upload local file to aliyun oss
 * @param {ParamsUploadLocalFile} payload
 * @returns {Promise<ReturnUploadLocalFile>}
 */
export const uploadLocalFileToAliOSS = async (payload) => {
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
};

/**
 * Normalize path
 * @param {string} filePath
 * @returns {string}
 */
const normalizePath = (filePath) => {
  return filePath.replace(/\\/g, "/");
};

/**
 * @typedef {Object} ParamsUploadDirToAliOSS
 * @property {AliOSSClient} client
 * @property {string} localPath
 * @property {string[]} ignorePathList
 * @property {boolean} [recursive = false]
 */

/**
 * Upload directory to aliyun oss
 * @param {ParamsUploadDirToAliOSS} payload
 * @returns {Promise<ReturnUploadLocalFile[]>}
 */
export const uploadDirToAliOSS = async (payload) => {
  const { client, localPath, ignorePathList, recursive = false } = payload;
  const globPath = recursive
    ? path.resolve(localPath, "**/*")
    : path.resolve(localPath, "*");
  /** @type {import('glob').GlobOptionsWithFileTypesUnset} */
  const globConfig = {
    windowsPathsNoEscape: true,
    // only want the files, not the dirs
    nodir: true,
    ignore: Array.from(new Set(["node_modules", ...(ignorePathList || [])])),
  };
  const allFiles = await glob.glob(globPath, globConfig);
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
};
