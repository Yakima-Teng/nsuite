/**
 * 七牛云接口文档：https://developer.qiniu.com/kodo/1289/nodejs#rs-delete
 */
import path from "path";
import { glob } from "glob";
import qiniu from "qiniu";
import { logError } from "./UtilsLog.js";
import { getError } from "./UtilsType.js";
import type {
  ListedObjectEntry,
  OperationResponse,
} from "qiniu/StorageResponseInterface.d.ts";

export type QiniuConfig = qiniu.conf.Config;
export type QiniuBucketManager = qiniu.rs.BucketManager;
export type QiniuMac = qiniu.auth.digest.Mac;
export type QiniuMacOptions = qiniu.auth.digest.MacOptions;
export type QiniuPutPolicyOptions = qiniu.rs.PutPolicyOptions;
export type QiniuListPrefixOptions = qiniu.rs.ListPrefixOptions;

export interface ParamsQiniuOSSGetMac {
  accessKey: string;
  secretKey: string;
  options?: QiniuMacOptions;
}

export interface ParamsQiniuOSSGetBucketManager {
  mac: QiniuMac;
  config: QiniuConfig;
}

export interface ParamsQiniuOSSGetPublicDownloadUrl {
  bucketManager: QiniuBucketManager;
  key: string;
  baseUrl?: string;
}

export interface ParamsQiniuOSSRefreshUrls {
  urls: string[];
  mac: QiniuMac;
}

interface ParamsQiniuOSSListFiles {
  bucketManager: QiniuBucketManager;
  bucket: string;
  options: QiniuListPrefixOptions;
}

export interface ParamsQiniuOSSDeleteRemotePathList {
  bucketManager: QiniuBucketManager;
  remotePathList: string[];
  bucket: string;
}

export interface ReturnQiniuOSSDeleteRemotePathList {
  successItems: string[];
  failItems: string[];
}

export interface ParamsQiniuOSSUploadLocalFile {
  config: QiniuConfig;
  mac: QiniuMac;
  localPath: string;
  key: string;
  baseUrl: string;
  bucket: string;
  putPolicyOptions?: QiniuPutPolicyOptions;
}

export interface ReturnQiniuOSSUploadLocalFile {
  key: string;
  etag: string;
  fileSize: number;
  bucket: string;
  name: string;
  url: string;
}

export interface QiniuOSSLocalPathAndKey {
  localPath: string;
  key: string;
}

export type FuncQiniuOSSUploadFileCallback = (
  payload:
    | {
        err: null;
        curIdx: number;
        total: number;
        file: ReturnQiniuOSSUploadLocalFile;
      }
    | { err: Error; curIdx: number; total: number; file: null },
) => void;

export interface ParamsQiniuOSSUploadDir {
  config: QiniuConfig;
  mac: QiniuMac;
  bucket: string;
  baseUrl?: string;
  keyPrefix?: string;
  putPolicyOptions?: QiniuPutPolicyOptions;
  localPath: string;
  ignorePathList?: string[];
  refresh?: boolean;
  recursive?: boolean;
  dryRun?: boolean;
  uploadCallback?: FuncQiniuOSSUploadFileCallback;
  maxTryTimes?: number;
  maxConcurrency?: number;
}

export interface ReturnQiniuOSSUploadDir {
  uploadedList: ReturnQiniuOSSUploadLocalFile[];
  refreshedUrlList: string[];
  allPaths: QiniuOSSLocalPathAndKey[];
}

/**
 * Utility functions for qiniu-oss
 * @module OSS-Qiniu
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

const getQiniuOssTimeout = (): number => {
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
 */
const getQiniuCacheRefreshCodeMessage = (code: number): string => {
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
 * Get mac from qiniu
 */
export function getMacFromQiniuOSS(payload: ParamsQiniuOSSGetMac): QiniuMac {
  const { accessKey, secretKey, options } = payload;
  return new qiniu.auth.digest.Mac(accessKey, secretKey, options);
}

/**
 * Get
 */
export function getConfigFromQiniuOSS(
  options: qiniu.conf.ConfigOptions,
): QiniuConfig {
  return new qiniu.conf.Config(options);
}

/**
 * Get bucket manager from qiniu
 */
export function getBucketManagerFromQiniuOSS(
  payload: ParamsQiniuOSSGetBucketManager,
): QiniuBucketManager {
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
 * Get public download url
 */
export function getPublicDownloadUrlFromQiniuOSS(
  payload: ParamsQiniuOSSGetPublicDownloadUrl,
): string {
  const { bucketManager, key, baseUrl = "" } = payload;
  return bucketManager.publicDownloadUrl(baseUrl, key);
}

/**
 * Refresh cdn urls
 */
export async function refreshUrlsFromQiniuOSS(
  payload: ParamsQiniuOSSRefreshUrls,
): Promise<string[]> {
  const { urls, mac } = payload;
  if (urls.length === 0) {
    return [];
  }
  const cdnManager = new qiniu.cdn.CdnManager(mac);

  /**
   * Promise function
   */
  const promiseFunc = (someUrls: string[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      /**
       * Callback function
       */
      const refreshCallback = (
        err: Error | undefined,
        respBody: { taskIds: Record<string, unknown> | null },
        respInfo: { statusCode: number; data: { code: number; error: string } },
      ): void => {
        if (err) {
          reject(err);
          return;
        }
        if (respInfo.statusCode !== 200) {
          logError("Failed in refreshUrlsFromQiniuOSS", respInfo);
          reject(new Error(`Abnormal statusCode: ${respInfo.statusCode}`));
          return;
        }
        if (respInfo.data && respInfo.data.code !== 200) {
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

  const groups: string[][] = [];
  const groupSize = 100;
  for (let i = 0; i < urls.length; i += groupSize) {
    groups.push(urls.slice(i, i + groupSize));
  }
  // 未避免并发太大，此处串行处理
  let returnUrls: string[] = [];
  for (const group of groups) {
    const tempUrls = await promiseFunc(group);
    returnUrls = returnUrls.concat(tempUrls);
  }
  return returnUrls;
}

/***
 * List all files under a remote directory
 */
// 查询某个远程目录下的文件列表
const listFilesFromQiniuOSS = async (
  payload: ParamsQiniuOSSListFiles,
): Promise<ListedObjectEntry[]> => {
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

  let returnItems: ListedObjectEntry[] = [];
  let nextMarker: string | undefined;
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
 * Delete files
 */
export async function deleteRemotePathListFromQiniuOSS(
  payload: ParamsQiniuOSSDeleteRemotePathList,
): Promise<ReturnQiniuOSSDeleteRemotePathList> {
  const { bucketManager, remotePathList, bucket } = payload;
  const successItems: string[] = [];
  const failItems: string[] = [];

  if (remotePathList.length === 0) {
    return {
      successItems: [],
      failItems: [],
    };
  }

  let allKeysToDelete: string[] = [];

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

  const deleteKeysGroups: string[][] = [];
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
    const listRes = (res.data || []) as OperationResponse[];
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
 * Upload local file to Qiniu
 */
export async function uploadLocalFileToQiniuOSS(
  payload: ParamsQiniuOSSUploadLocalFile,
): Promise<ReturnQiniuOSSUploadLocalFile> {
  const { config, mac, localPath, key, bucket, putPolicyOptions, baseUrl } =
    payload;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  const options: QiniuPutPolicyOptions = {
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

  try {
    // 文件上传
    const res = await formUploader.putFile(
      uploadToken,
      key,
      localPath,
      putExtra,
    );
    if (!res.data || !res.data.key) {
      logError("Failed uploadLocalFileToQiniuOSS", res);
      throw new Error(`Failed to upload ${localPath} to ${bucket}:${key}`);
    }
    const returnData = res.data as ReturnQiniuOSSUploadLocalFile;
    return {
      ...returnData,
      url: `${baseUrl}/${returnData.key}`,
    };
  } catch (err) {
    logError(`Failed uploadLocalFileToQiniuOSS: ${getError(err).message}`);
    throw new Error(`Failed to upload ${localPath} to ${bucket}:${key}`);
  }
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
 * Upload directory to Qiniu OSS
 */
export async function uploadDirToQiniuOSS(
  payload: ParamsQiniuOSSUploadDir,
): Promise<ReturnQiniuOSSUploadDir> {
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
    maxTryTimes = 3,
    maxConcurrency = 500,
  } = payload;
  const globPath = recursive
    ? path.resolve(localPath, "**/*")
    : path.resolve(localPath, "*");
  const finalIgnorePathList = Array.from(
    new Set(
      (ignorePathList || []).map((tempPath) => tempPath.replace(/\\/g, "/")),
    ),
  );
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
  const maxGroupSize = maxConcurrency;
  for (let i = 0; i < allPaths.length; i += maxGroupSize) {
    groups.push(allPaths.slice(i, i + maxGroupSize));
  }
  const uploadedList: ReturnQiniuOSSUploadLocalFile[] = [];
  const totalCount = allPaths.length;
  let curIdx = 0;
  for (const group of groups) {
    const list: Array<ReturnQiniuOSSUploadLocalFile | void> = await Promise.all(
      group.map(({ localPath, key }) => {
        const funcPromise =
          async (): Promise<ReturnQiniuOSSUploadLocalFile | void> => {
            let tryTimes = 0;
            let tempErr = null;
            while (maxTryTimes === Infinity || tryTimes < maxTryTimes) {
              tryTimes++;
              try {
                const fileInfo = await uploadLocalFileToQiniuOSS({
                  config,
                  mac,
                  localPath,
                  key,
                  baseUrl,
                  bucket,
                  putPolicyOptions,
                });
                tempErr = null;
                if (typeof uploadCallback === "function") {
                  uploadCallback({
                    err: null,
                    curIdx,
                    total: totalCount,
                    file: fileInfo,
                  });
                }
                curIdx++;
                return fileInfo;
              } catch (err) {
                tempErr = err;
              }
              await new Promise((resolve) => {
                setTimeout(() => {
                  resolve(undefined);
                }, tryTimes * 1000);
              });
            }
            if (typeof uploadCallback === "function") {
              uploadCallback({
                err: getError(tempErr),
                curIdx,
                total: totalCount,
                file: null,
              });
            }
            curIdx++;
          };
        return funcPromise();
      }),
    );
    const successList = list.filter((item) => item !== undefined);
    uploadedList.push(...successList);
  }

  let refreshedUrlList: string[] = [];
  if (refresh) {
    const bucketManager = getBucketManagerFromQiniuOSS({
      config,
      mac,
    });
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
