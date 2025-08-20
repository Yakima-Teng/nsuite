/**
 * 七牛云接口文档：https://developer.qiniu.com/kodo/1289/nodejs#rs-delete
 */
import path from "path";
import { glob } from "glob";
import qiniu from "qiniu";

/**
 * @typedef {keyof typeof import('qiniu').zone} QiniuZoneName
 * @typedef {import('qiniu').conf.Config} QiniuConfig
 * @typedef {import('qiniu').rs.BucketManager} QiniuBucketManager
 * @typedef {import('qiniu').auth.digest.Mac} QiniuMac
 * @typedef {import('qiniu').auth.digest.MacOptions} QiniuMacOptions
 * @typedef {import('qiniu').rs.PutPolicyOptions} QiniuPutPolicyOptions
 * @typedef {import('qiniu/StorageResponseInterface.d.ts').ListedObjectEntry} QiniuListedObjectEntry
 * @typedef {import('qiniu').rs.ListPrefixOptions} QiniuListPrefixOptions
 * @typedef {import('qiniu').httpc.ResponseWrapper} QiniuHttpcResponseWrapper
 * @typedef {import('qiniu/StorageResponseInterface.d.ts').OperationResponse} QiniuOperationResponse
 */

/**
 * @typedef {Object} ParamsQiniuOSSGetMac
 * @property {string} accessKey
 * @property {string} secretKey
 * @property {QiniuMacOptions} [options]
 */

/**
 * Get mac from qiniu
 * @param {ParamsQiniuOSSGetMac} payload
 * @returns {QiniuMac}
 */
export const getMacFromQiniuOSS = (payload) => {
  const { accessKey, secretKey, options } = payload;
  return new qiniu.auth.digest.Mac(accessKey, secretKey, options);
};

/**
 * Get
 * @param {import('qiniu').conf.ConfigOptions} options
 * @returns {QiniuConfig}
 */
export const getConfigFromQiniuOSS = (options) => {
  return new qiniu.conf.Config(options);
};

/**
 * @typedef {Object} ParamsQiniuOSSGetBucketManager
 * @property {QiniuMac} mac
 * @property {QiniuConfig} config
 */

/**
 * Get bucket manager from qiniu
 * @param {ParamsQiniuOSSGetBucketManager} payload
 * @returns {QiniuBucketManager}
 */
export const getBucketManagerFromQiniuOSS = (payload) => {
  const { mac, config } = payload;
  return new qiniu.rs.BucketManager(mac, config);
};

/**
 * @typedef {Object} ParamsQiniuOSSGetPublicDownloadUrl
 * @property {QiniuBucketManager} bucketManager
 * @property {string} key
 * @property {string} [baseUrl]
 */

/**
 * Get public download url
 * @param {ParamsQiniuOSSGetPublicDownloadUrl} payload
 * @returns {string}
 */
export const getPublicDownloadUrlFromQiniuOSS = (payload) => {
  const { bucketManager, key, baseUrl = "" } = payload;
  return bucketManager.publicDownloadUrl(baseUrl, key);
};

/**
 * @typedef {Object} ParamsQiniuOSSRefreshUrls
 * @property {string[]} urls
 * @property {QiniuMac} mac
 */

/**
 * Refresh cdn urls
 * @param {ParamsQiniuOSSRefreshUrls} payload
 * @returns {Promise<string[]>}
 */
export const refreshUrlsFromQiniuOSS = async (payload) => {
  const { urls, mac } = payload;
  if (urls.length === 0) {
    return [];
  }
  const cdnManager = new qiniu.cdn.CdnManager(mac);

  /**
   * Promise function
   * @param {string[]} someUrls
   * @returns {Promise<string[]>}
   */
  const promiseFunc = (someUrls) => {
    /** @type {Promise<string[]>} */
    return new Promise((resolve, reject) => {
      /**
       * Callback function
       * @param {Error | undefined} err
       * @param {{ taskIds: Record<string, unknown> }} respBody
       * @param {{ statusCode: number; [key: string]: unknown; }} respInfo
       */
      const refreshCallback = (err, respBody, respInfo) => {
        if (err) {
          reject(err);
          return;
        }
        if (respInfo.statusCode !== 200) {
          reject(respInfo);
          return;
        }
        try {
          resolve(Object.keys(respBody.taskIds));
        } catch (err) {
          console.error(
            "Failed in Object.keys(respBody.taskIds)",
            err,
            respInfo,
          );
          resolve([]);
        }
      };

      cdnManager.refreshUrls(someUrls, refreshCallback);
    });
  };

  /** @type {string[][]} */
  const groups = [];
  const groupSize = 100;
  for (let i = 0; i < urls.length; i += groupSize) {
    groups.push(urls.slice(i, i + groupSize));
  }
  // 未避免并发太大，此处串行处理
  /** @type {string[]} */
  let returnUrls = [];
  for (const group of groups) {
    const tempUrls = await promiseFunc(group);
    returnUrls = returnUrls.concat(tempUrls);
  }
  return returnUrls;
};

/**
 * @typedef {Object} ParamsQiniuOSSListFiles
 * @property {QiniuBucketManager} bucketManager
 * @property {string} bucket
 * @property {QiniuListPrefixOptions} options
 */

/***
 * List all files under a remote directory
 * @param {ParamsQiniuOSSListFiles} payload
 * @return {Promise<QiniuListedObjectEntry[]>}
 */
// 查询某个远程目录下的文件列表
const listFilesFromQiniuOSS = async (payload) => {
  const { bucketManager, bucket, options } = payload;
  const { limit = 1000 } = options;

  const prefix = options.prefix || "";
  if (prefix) {
    if (prefix.startsWith("http")) {
      throw new Error(
        `prefix should not start with http, your invalid prefix is ${prefix}`,
      );
    }
    if (prefix.startsWith("/")) {
      throw new Error(
        `prefix should not start with /, your invalid prefix is ${prefix}`,
      );
    }
  }

  /** @type {QiniuListedObjectEntry[]} */
  let returnItems = [];
  /** @type {string | undefined} */
  let nextMarker = undefined;
  do {
    const res = await bucketManager.listPrefix(bucket, {
      ...options,
      limit: limit || 1000,
      marker: nextMarker,
    });
    nextMarker = res.data.marker;
    returnItems = returnItems.concat(res.data.items || []);
  } while (nextMarker && !limit);
  return returnItems;
};

/**
 * @typedef {Object} ParamsQiniuOSSDeleteRemotePathList
 * @property {QiniuBucketManager} bucketManager
 * @property {string[]} remotePathList
 * @property {string} bucket
 */

/**
 * @typedef {Object} ReturnQiniuOSSDeleteRemotePathList
 * @property {string[]} successItems
 * @property {string[]} failItems
 */

/**
 * Delete files
 * @param {ParamsQiniuOSSDeleteRemotePathList} payload
 * @returns {Promise<ReturnQiniuOSSDeleteRemotePathList>}
 */
export const deleteRemotePathListFromQiniuOSS = async (payload) => {
  const { bucketManager, remotePathList, bucket } = payload;
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

  /** @type {string[]} */
  let allKeysToDelete = [];

  // 有目录需要清空的话，清空对应目录下的文件
  for (const prefix of remotePathList) {
    const fileList = await listFilesFromQiniuOSS({
      bucketManager,
      bucket,
      options: {
        prefix,
        limit: 0,
      },
    });
    const keysToDelete = fileList.map((item) => item.key);
    allKeysToDelete = allKeysToDelete.concat(keysToDelete);
  }

  /** @type {string[][]} */
  const deleteKeysGroups = [];
  const maxOperationSize = 1000;
  for (let i = 0; i < allKeysToDelete.length; i += maxOperationSize) {
    deleteKeysGroups.push(allKeysToDelete.slice(i, i + maxOperationSize));
  }

  // 避免并发过高，此处串行执行
  for (const deleteKeysGroup of deleteKeysGroups) {
    const res = await bucketManager.batch(
      deleteKeysGroup.map((key) => {
        return qiniu.rs.deleteOp(bucket, key);
      }),
    );
    /** @type {QiniuOperationResponse[]} */
    const listRes = res.data || [];
    listRes.forEach((item, idx) => {
      if (item.code === 200) {
        successItems.push(deleteKeysGroup[idx]);
      } else {
        failItems.push(deleteKeysGroup[idx]);
      }
    });
  }

  return {
    successItems,
    failItems,
  };
};

/**
 * @typedef {Object} ParamsQiniuOSSUploadLocalFile
 * @property {QiniuConfig} config
 * @property {QiniuMac} mac
 * @property {string} localPath
 * @property {string} key
 * @property {string} baseUrl
 * @property {string} bucket
 * @property {QiniuPutPolicyOptions} [putPolicyOptions]
 */

/**
 * @typedef {Object} ReturnQiniuOSSUploadLocalFile
 * @property {string} key
 * @property {string} etag
 * @property {number} fileSize
 * @property {string} bucket
 * @property {string} name
 * @property {string} url
 */

/**
 * Upload local file to Qiniu
 * @param {ParamsQiniuOSSUploadLocalFile} payload
 * @returns {Promise<ReturnQiniuOSSUploadLocalFile>}
 */
export const uploadLocalFileToQiniuOSS = async (payload) => {
  const { config, mac, localPath, key, bucket, putPolicyOptions, baseUrl } =
    payload;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  /** @type {QiniuPutPolicyOptions} */
  const options = {
    // 指定了key，就可以支持覆盖上传
    scope: `${bucket}:${key}`,
    // .html文件缓存30秒，其他文件缓存10小时
    expires: key.endsWith(".html") ? 30 : 36000,
    ...(putPolicyOptions || {}),
    returnBody:
      '{"key":"$(key)","etag":"$(etag)","fileSize":$(fsize),"bucket":"$(bucket)","name":"$(fname)"}',
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);
  // 文件上传
  const res = await formUploader.putFile(uploadToken, key, localPath, putExtra);
  if (!res.data || !res.data.key) {
    console.error("Failed uploadLocalFileToQiniuOSS", res);
    throw new Error(`Failed to upload ${localPath} to ${bucket}:${key}`);
  }
  /** @type {ReturnQiniuOSSUploadLocalFile} */
  const returnData = res.data;
  return {
    ...returnData,
    url: `${baseUrl}/${returnData.key}`,
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
 * @callback QiniuOSSUploadFileCallback
 * @param {number} curIdx - current index, starting from 0, ranging from 0 to (total - 1)
 * @param {number} total - total count
 * @param {ReturnQiniuOSSUploadLocalFile} file - file info
 */

/**
 * @typedef {Object} ParamsQiniuOSSUploadDir
 * @property {QiniuConfig} config
 * @property {QiniuMac} mac
 * @property {string} bucket
 * @property {string} [baseUrl] - needed if refresh is set true
 * @property {string} [keyPrefix = '']
 * @property {QiniuPutPolicyOptions} [putPolicyOptions = {}]
 * @property {string} localPath
 * @property {string[]} [ignorePathList = []]
 * @property {boolean} [refresh = false]
 * @property {boolean} [recursive = false]
 * @property {boolean} [dryRun = false] - set to true if you want to check which files will be deployed before real deployment
 * @property {QiniuOSSUploadFileCallback} [uploadCallback] - callback function for upload progress
 */

/**
 * @typedef {Object} ReturnQiniuOSSUploadDir
 * @property {ReturnQiniuOSSUploadLocalFile[]} uploadedList
 * @property {string[]} refreshedUrlList
 * @property {{ localPath: string; key: string }[]} allPaths
 */
/**
 * Upload directory to Qiniu OSS
 * @param {ParamsQiniuOSSUploadDir} payload
 * @returns{Promise<ReturnQiniuOSSUploadDir>}
 */
export const uploadDirToQiniuOSS = async (payload) => {
  const {
    config,
    mac,
    bucket,
    baseUrl = "",
    keyPrefix = "",
    putPolicyOptions = {},
    localPath,
    ignorePathList = [],
    refresh = false,
    recursive = false,
    dryRun = false,
    uploadCallback,
  } = payload;
  const globPath = recursive
    ? path.resolve(localPath, "**/*")
    : path.resolve(localPath, "*");
  const finalIgnorePathList = Array.from(
    new Set([
      "node_modules/**",
      ...(ignorePathList || []).map((tempPath) => tempPath.replace(/\\/g, "/")),
    ]),
  );
  /** @type {import('glob').GlobOptionsWithFileTypesUnset} */
  const globConfig = {
    windowsPathsNoEscape: true,
    // only want the files, not the dirs
    nodir: true,
    ignore: finalIgnorePathList,
  };
  const allFiles = await glob(globPath, globConfig);
  const rootPath = `${normalizePath(path.resolve(localPath))}/`;
  const allPaths = allFiles.map((filePath) => {
    return {
      localPath: normalizePath(filePath),
      key: normalizePath(
        path.join(keyPrefix, normalizePath(filePath).replace(rootPath, "")),
      ),
    };
  });
  if (dryRun) {
    return {
      allPaths,
      uploadedList: [],
      refreshedUrlList: [],
    };
  }

  // 未避免并发数量过大，这里限制并发数量
  const groups = [];
  const maxGroupSize = 500;
  for (let i = 0; i < allPaths.length; i += maxGroupSize) {
    groups.push(allPaths.slice(i, i + maxGroupSize));
  }
  /** @type {ReturnQiniuOSSUploadLocalFile[]} */
  const uploadedList = [];
  const totalCount = allPaths.length;
  let curIdx = 0;
  for (const group of groups) {
    const list = await Promise.all(
      group.map(({ localPath, key }) => {
        let tryTimes = 0;
        const maxTryTimes = 3;
        const funcPromise = () => {
          /**
           * @callback QiniuOSSUploadFileCatchCallback
           * @param {Error} err - 捕获到的错误对象
           * @returns {Promise<ReturnQiniuOSSUploadLocalFile>}
           */

          /** @type {QiniuOSSUploadFileCatchCallback} */
          const catchCallback = (err) => {
            tryTimes++;
            if (tryTimes < maxTryTimes) {
              return funcPromise();
            }
            throw err;
          };

          return uploadLocalFileToQiniuOSS({
            config,
            mac,
            localPath,
            key,
            baseUrl,
            bucket,
            putPolicyOptions,
          })
            .then((fileInfo) => {
              if (typeof uploadCallback === "function") {
                uploadCallback(curIdx, totalCount, fileInfo);
              }
              curIdx++;
              return fileInfo;
            })
            .catch(catchCallback);
        };
        return funcPromise();
      }),
    );
    uploadedList.push(...list);
  }

  /** @type {string[]} */
  let refreshedUrlList = [];
  if (refresh) {
    const bucketManager = getBucketManagerFromQiniuOSS({
      config,
      mac,
    });
    /** @type {string[]} */
    const downloadUrlList = uploadedList.map((item) => {
      return getPublicDownloadUrlFromQiniuOSS({
        bucketManager,
        key: item.key,
        baseUrl,
      });
    });
    refreshedUrlList = await refreshUrlsFromQiniuOSS({
      mac,
      urls: downloadUrlList,
    });
  }
  return {
    allPaths,
    uploadedList,
    refreshedUrlList,
  };
};
