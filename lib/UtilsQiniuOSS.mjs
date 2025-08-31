/**
 * 七牛云接口文档：https://developer.qiniu.com/kodo/1289/nodejs#rs-delete
 */
import path from "path";
import { glob } from "glob";
import qiniu from "qiniu";
import { logError } from "#lib/UtilsLog";

/**
 * @typedef {qiniu.httpc.HttpClientOptions} QiniuHttpClientRawOptions
 */

/**
 * @typedef {QiniuHttpClientRawOptions} QiniuHttpClientOptions
 * @property {number} [timeout]
 */

const getQiniuOssTimeout = () => {
  const { QINIU_HTTP_CLIENT_TIMEOUT } = process.env;
  if (QINIU_HTTP_CLIENT_TIMEOUT) {
    return Number(QINIU_HTTP_CLIENT_TIMEOUT);
  }
  return 0;
};

/**
 * 获取七牛云自定义错误码的错误信息
 *
 * reference: https://developer.qiniu.com/fusion/1229/cache-refresh
 * 200  success  成功
 * 400031  invalid url  请求中存在无效的 url，请确保 url 格式正确
 * 400032  invalid host  请求中存在无效的域名，请确保域名格式正确
 * 400034  refresh url limit error  请求次数超出当日刷新限额
 * 400036  invalid request id  无效的请求 id
 * 400037  url has existed  url 正在刷新中
 * 400038  refresh dir authority error  没有刷新目录的权限， 如果需要请联系技术支持
 * 403024  single user QPS Rate limited  请求达到单用户QPS限制，请重试或联系我们
 * 403022  server QPS Rate limited  请求达到全局QPS限制，请联系我们
 * 500000  internal error  服务端内部错误，请联系技术支持
 * @param {number} code
 * @returns {string}
 */
const getQiniuCacheRefreshCodeMessage = (code) => {
  switch (code) {
    case 200:
      return "成功";
    case 400031:
      return "请求中存在无效的 url，请确保 url 格式正确";
    case 400032:
      return "请求中存在无效的域名，请确保域名格式正确";
    case 400034:
      return "请求次数超出当日刷新限额";
    case 400036:
      return "无效的请求 id";
    case 400037:
      return "url 正在刷新中";
    case 400038:
      return "没有刷新目录的权限， 如果需要请联系技术支持";
    case 403024:
      return "请求达到单用户QPS限制，请重试或联系我们";
    case 403022:
      return "请求达到全局QPS限制，请联系我们";
    case 500000:
      return "服务端内部错误，请联系技术支持";
    default:
      return "未知错误";
  }
};

/**
 * @typedef {'Zone_z0' | 'Zone_z1' | 'Zone_z2' | 'Zone_na0' | 'Zone_as0'} QiniuZoneName
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
export function getMacFromQiniuOSS(payload) {
  const { accessKey, secretKey, options } = payload;
  return new qiniu.auth.digest.Mac(accessKey, secretKey, options);
}

/**
 * Get
 * @param {import('qiniu').conf.ConfigOptions} options
 * @returns {QiniuConfig}
 */
export function getConfigFromQiniuOSS(options) {
  return new qiniu.conf.Config(options);
}

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
export function getBucketManagerFromQiniuOSS(payload) {
  const { mac, config } = payload;
  const bm = new qiniu.rs.BucketManager(mac, config);
  const qiniuTimeout = getQiniuOssTimeout();
  if (qiniuTimeout) {
    // @ts-ignore
    bm._httpClient.timeout = qiniuTimeout;
  }
  return bm;
}

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
export function getPublicDownloadUrlFromQiniuOSS(payload) {
  const { bucketManager, key, baseUrl = "" } = payload;
  return bucketManager.publicDownloadUrl(baseUrl, key);
}

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
export async function refreshUrlsFromQiniuOSS(payload) {
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
       * @typedef {Object} QiniuRefreshUrlsRespBody
       * @property {number} code
       * @property {string} error
       * @property {string} requestId
       * @property {null | Record<string, unknown>} taskIds
       */
      /**
       * @typedef {Object} QiniuRefreshUrlsRespInfo
       * @property {number} status
       * @property {number} statusCode
       * @property {string} statusMessage
       * @property {Record<string, string>} headers
       * @property {number} size
       * @property {boolean} aborted
       * @property {number} rt
       * @property {QiniuRefreshUrlsRespBody} data
       * @property {string[]} requestUrls
       * @property {number | null} timing
       * @property {string} remoteAddress
       * @property {number} remotePort
       * @property {number} socketHandledRequests
       * @property {number} socketHandledResponses
       */
      /**
       * Callback function
       * @param {Error | undefined} err
       * @param {QiniuRefreshUrlsRespBody} respBody
       * @param {QiniuRefreshUrlsRespInfo} respInfo
       */
      const refreshCallback = (err, respBody, respInfo) => {
        if (err) {
          reject(err);
          return;
        }
        if (respInfo.statusCode !== 200) {
          logError("Failed in refreshUrlsFromQiniuOSS", respInfo);
          reject(new Error(`Abnormal statusCode: ${respInfo.statusCode}`));
          return;
        }
        if (respInfo.data && respInfo.data.code && respInfo.data.error) {
          const resCode = respInfo.data.code;
          const resError = respInfo.data.error;
          const resErrMsg = getQiniuCacheRefreshCodeMessage(resCode);
          let reason = `[${resCode}]: ${resError}`;
          if (resErrMsg) {
            reason += `, ${resErrMsg}`;
          }
          reject(new Error(reason));
          return;
        }
        if (!respBody.taskIds) {
          reject(new Error("Empty respBody.taskIds"));
          return;
        }
        try {
          resolve(Object.keys(respBody.taskIds));
        } catch (err) {
          logError("Failed in Object.keys(respBody.taskIds)", err, respInfo);
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
}

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
  const { limit = 100 } = options;

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
      limit: limit || 100,
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
export async function deleteRemotePathListFromQiniuOSS(payload) {
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
  const maxOperationSize = 100;
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
}

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
export async function uploadLocalFileToQiniuOSS(payload) {
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
    logError("Failed uploadLocalFileToQiniuOSS", res);
    throw new Error(`Failed to upload ${localPath} to ${bucket}:${key}`);
  }
  /** @type {ReturnQiniuOSSUploadLocalFile} */
  const returnData = res.data;
  return {
    ...returnData,
    url: `${baseUrl}/${returnData.key}`,
  };
}

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
 * @typedef {Object} QiniuOSSLocalPathAndKey
 * @property {string} localPath
 * @property {string} key
 */

/**
 * @typedef {Object} ReturnQiniuOSSUploadDir
 * @property {ReturnQiniuOSSUploadLocalFile[]} uploadedList
 * @property {string[]} refreshedUrlList
 * @property {QiniuOSSLocalPathAndKey[]} allPaths
 */
/**
 * Upload directory to Qiniu OSS
 * @param {ParamsQiniuOSSUploadDir} payload
 * @returns {Promise<ReturnQiniuOSSUploadDir>}
 *
 * @example
 * import {
 *   getConfigFromQiniuOSS,
 *   getMacFromQiniuOSS,
 *   joinPath,
 *   refreshUrlsFromQiniuOSS,
 *   uploadDirToQiniuOSS,
 * } from "nsuite";
 *
 * process.env.QINIU_HTTP_CLIENT_TIMEOUT = "120000";
 *
 * const mac = getMacFromQiniuOSS({
 *   accessKey: QINIU_ACCESS_KEY,
 *   secretKey: QINIU_SECRET_KEY,
 * });
 * const config = getConfigFromQiniuOSS({});
 * const { uploadedList } = await uploadDirToQiniuOSS({
 *   config,
 *   mac,
 *   bucket: QINIU_BUCKET_NAME,
 *   baseUrl: QINIU_PUBLIC_BUCKET_DOMAIN,
 *   keyPrefix: CDN_PATH_PREFIX,
 *   putPolicyOptions: {
 *     scope: QINIU_BUCKET_NAME,
 *     expires: 7200,
 *   },
 *   localPath: PATH_PUBLIC,
 *   ignorePathList: ["node_modules/**"],
 *   refresh: false,
 *   recursive: true,
 *   dryRun: false,
 *   uploadCallback: (curIdx, totalCount, fileInfo) => {
 *     logger.info(`Uploaded ${curIdx + 1}/${totalCount} ${fileInfo.key}`);
 *   },
 * });
 *
 * const urlsToRefresh = uploadedList
 *   .filter((item) => {
 *     return item.key.endsWith(".css") || item.key.endsWith(".js");
 *   })
 *   .map((item) => item.url);
 *
 * logger.info(`Start refreshing CDN: ${urlsToRefresh.join(", ")}.`);
 * const refreshedUrls = await refreshUrlsFromQiniuOSS({
 *   urls: urlsToRefresh,
 *   mac,
 * });
 *
 * logger.info(`Refreshed urls: ${refreshedUrls.join(", ")}.`);
 */
export async function uploadDirToQiniuOSS(payload) {
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
}
