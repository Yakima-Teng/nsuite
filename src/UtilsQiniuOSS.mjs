/**
 * 七牛云接口文档：https://developer.qiniu.com/kodo/1289/nodejs#rs-delete
 */
import path from 'path';
import { glob } from 'glob';
import qiniu, { auth, conf, rs } from 'qiniu';

/**
 * @typedef {keyof typeof import('qiniu').zone} QiniuZoneName
 * @typedef {import('qiniu').conf.Config} QiniuConfig
 * @typedef {import('qiniu').rs.BucketManager} QiniuBucketManager
 * @typedef {import('qiniu').auth.digest.Mac} QiniuMac
 * @typedef {import('qiniu').auth.digest.MacOptions} QiniuMacOptions
 * @typedef {import('qiniu').rs.PutPolicyOptions} QiniuPutPolicyOptions
 * @typedef {import('qiniu/StorageResponseInterface').ListedObjectEntry} QiniuListedObjectEntry
 * @typedef {import('qiniu').rs.ListPrefixOptions} QiniuListPrefixOptions
 * @typedef {import('qiniu').httpc.ResponseWrapper} QiniuHttpcResponseWrapper
 * @typedef {import('qiniu/StorageResponseInterface').OperationResponse} QiniuOperationResponse
 */

/**
 * @typedef {Object} ParamsQiniuGetMac
 * @property {string} accessKey
 * @property {string} secretKey
 * @property {QiniuMacOptions} [options]
 */

/**
 * Get mac from qiniu
 * @param {ParamsQiniuGetMac} payload
 * @returns {QiniuMac}
 */
export const getMacFromQiniu = (payload) => {
  const { accessKey, secretKey, options } = payload
  return new qiniu.auth.digest.Mac(accessKey, secretKey, options);
}

/**
 * Get
 * @returns {QiniuConfig}
 */
export const getConfigFromQiniu = () => {
  return new qiniu.conf.Config();
}

/**
 * @typedef {Object} ParamsQiniuGetBucketManager
 * @property {QiniuMac} mac
 * @property {QiniuConfig} config
 */

/**
 * Get bucket manager from qiniu
 * @param {ParamsQiniuGetBucketManager} payload
 * @returns {QiniuBucketManager}
 */
export const getBucketManagerFromQiniuOSS = (payload) => {
  const { mac, config } = payload
  return new qiniu.rs.BucketManager(mac, config);
}

/**
 * @typedef {Object} ParamsQiniuGetPublicDownloadUrl
 * @property {QiniuBucketManager} bucketManager
 * @property {string} key
 * @property {string} [baseUrl]
 */

/**
 * Get public download url
 * @param {ParamsQiniuGetPublicDownloadUrl} payload
 * @returns {string}
 */
export const getPublicDownloadUrlFromQiniuOSS = (payload) => {
  const { bucketManager, key, baseUrl } = payload
  return bucketManager.publicDownloadUrl(baseUrl, key);
};

/**
 * @typedef {Object} ParamsRefreshUrlsFromQiniuOSS
 * @property {string[]} urls
 * @property {QiniuMac} mac
 */

/**
 * Refresh cdn urls
 * @param {ParamsRefreshUrlsFromQiniuOSS} payload
 * @returns {Promise<string[]>}
 */
export const refreshUrlsFromQiniuOSS = async (payload) => {
  const { urls, mac } = payload
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
        } catch (e) {
          resolve([]);
        }
      }

      cdnManager.refreshUrls(someUrls, refreshCallback);
    });
  }

  /** @type {string[][]} */
  const groups = []
  const groupSize = 100
  for (let i = 0; i < urls.length; i += groupSize) {
    groups.push(urls.slice(i, i + groupSize))
  }
  // 未避免并发太大，此处串行处理
  /** @type {string[]} */
  let returnUrls = []
  for (const group of groups) {
    const tempUrls = await promiseFunc(group);
    returnUrls = returnUrls.concat(tempUrls)
  }
  return returnUrls
};

/**
 * @typedef {Object} ParamsQiniuListFiles
 * @property {QiniuBucketManager} bucketManager
 * @property {string} bucket
 * @property {QiniuListPrefixOptions} options
 */

/***
 * List all files under a remote directory
 * @param {ParamsQiniuListFiles} payload
 * @return {Promise<QiniuListedObjectEntry[]>}
 */
// 查询某个远程目录下的文件列表
const listFilesFromQiniuOSS = async (payload) => {
  const { bucketManager, bucket, options } = payload
  const { limit = 1000 } = options

  /** @type {QiniuListedObjectEntry[]} */
  let returnItems = []
  /** @type {string | null} */
  let nextMarker = null
  do {
    const res = await bucketManager.listPrefix(bucket, {
      ...options,
      limit: limit || 1000,
      marker: nextMarker,
    });
    nextMarker = res.data.marker
    returnItems = returnItems.concat(res.data.items || [])
  } while (nextMarker && !limit)
  return returnItems
};

/**
 * @typedef {Object} ParamsQiniuDeleteRemotePathList
 * @property {QiniuBucketManager} bucketManager
 * @property {string[]} remotePathList
 * @property {string} bucket
 */

/**
 * @typedef {Object} ReturnQiniuDeleteRemotePathList
 * @property {string[]} successItems
 * @property {string[]} failItems
 */

/**
 * Delete files
 * @param {ParamsQiniuDeleteRemotePathList} payload
 * @returns {Promise<ReturnQiniuDeleteRemotePathList>}
 */
export const deleteRemotePathListFromQiniuOSS = async (payload) => {
  const { bucketManager, remotePathList, bucket } = payload
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
  let allKeysToDelete = []

  // 有目录需要清空的话，清空对应目录下的文件
  for (const prefix of remotePathList) {
    const fileList = await listFilesFromQiniuOSS({
      bucketManager,
      bucket,
      options: {
        prefix,
        limit: 0
      },
    });
    const keysToDelete = fileList.map((item) => item.key);
    allKeysToDelete = allKeysToDelete.concat(keysToDelete)
  }

  /** @type {string[][]} */
  const deleteKeysGroups = []
  const maxOperationSize = 1000
  for (let i = 0; i < allKeysToDelete.length; i += maxOperationSize) {
    deleteKeysGroups.push(allKeysToDelete.slice(i, i + maxOperationSize))
  }

  // 避免并发过高，此处串行执行
  for (const deleteKeysGroup of deleteKeysGroups) {
    const res = await bucketManager.batch(
      deleteKeysGroup.map((key) => {
        return qiniu.rs.deleteOp(bucket, key)
      })
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

// 上传本地文件到七牛云
interface IPayloadUploadLocalFileToQiNiu {
  // 文件的本地绝对路径
  localPath: string;
  // 文件在服务器上相对于 uploadRemotePrefix的相对路径
  relativePath: string;
  putPolicyOptions?: PutPolicyOptions;
}
interface IReturnUploadLocalFileToQiNiu {
  key: string;
  etag: string;
  fileSize: string;
  bucket: string;
  name: string;
}
const uploadLocalFile = async ({
  localPath,
  relativePath,
  putPolicyOptions,
}: IPayloadUploadLocalFileToQiNiu): Promise<IReturnUploadLocalFileToQiNiu> => {
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();
  const key = `${_opts.uploadRemotePrefix}${relativePath}`.replace(/^\//, '');

  const options = {
    // 指定了key，就可以支持覆盖上传
    scope: `${_opts.bucketName}:${key}`,
    // .html文件缓存30秒，其他文件缓存10小时
    expires: key.endsWith('.html') ? 30 : 36000,
    ...(putPolicyOptions || {}),
    returnBody:
      '{"key":"$(key)","etag":"$(etag)","fileSize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);
  // 文件上传
  const res = await formUploader.putFile(uploadToken, key, localPath, putExtra);
  return res.data as IReturnUploadLocalFileToQiNiu;
};

// 上传目录下的文件到七牛云
interface IPayloadUploadDir {
  fromPath: string;
  ignore?: string[];
  refresh: boolean;
  recursive?: boolean;
}
export const uploadDir = async ({
  fromPath,
  ignore,
  refresh = false,
  recursive = true,
}: IPayloadUploadDir): Promise<IReturnUploadLocalFileToQiNiu[]> => {
  const allFiles = await glob(
    path.resolve(recursive ? `${fromPath}/**/*` : `${fromPath}/*`),
    {
      windowsPathsNoEscape: true,
      // only want the files, not the dirs
      nodir: true,
      ignore: Array.from(new Set(['node_modules', ...(ignore || [])])),
    }
  );
  const normalizePath = (filePath: string): string => {
    return filePath.replace(/\\/g, '/');
  };
  const rootPath = `${normalizePath(path.resolve(fromPath))}/`;
  const allPaths = allFiles.map((filePath) => {
    return {
      localPath: normalizePath(filePath),
      relativePath: normalizePath(filePath).replace(rootPath, ''),
    };
  });
  const list = await Promise.all(allPaths.map(uploadLocalFile));
  console.log(
    chalk.yellow(
      `Number of files uploaded to remote (${list.length} in total):`
    )
  );
  console.log(chalk.blue(list.map((item) => item.key).join('\n')));
  console.log();

  if (refresh) {
    const keys = list.map((item) => item.key);
    const downloadUrlList = getPublicDownloadUrl(keys);
    let refreshedUrlList: string[] = [];
    if (downloadUrlList.length > 0) {
      const numGroups = Math.ceil(downloadUrlList.length / 100);
      for (let i = 0; i < numGroups; i++) {
        const tempRefreshedUrlList = await refreshCDN(
          downloadUrlList.slice(i * 100, (i + 1) * 100)
        );
        refreshedUrlList = [...refreshedUrlList, ...tempRefreshedUrlList];
      }
    }
    if (refreshedUrlList.length > 0) {
      console.log(
        chalk.yellow(
          `Number of urls refreshed (${refreshedUrlList.length} in total):`
        )
      );
      console.log(chalk.blue(refreshedUrlList.join('\n')));
      console.log();
    }
  }
  return list;
};
export type TUploadDir = typeof uploadDir;
