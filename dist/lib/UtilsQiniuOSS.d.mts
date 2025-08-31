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
export function getMacFromQiniuOSS(payload: ParamsQiniuOSSGetMac): QiniuMac;
/**
 * Get
 * @param {import('qiniu').conf.ConfigOptions} options
 * @returns {QiniuConfig}
 */
export function getConfigFromQiniuOSS(options: import("qiniu").conf.ConfigOptions): QiniuConfig;
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
export function getBucketManagerFromQiniuOSS(payload: ParamsQiniuOSSGetBucketManager): QiniuBucketManager;
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
export function getPublicDownloadUrlFromQiniuOSS(payload: ParamsQiniuOSSGetPublicDownloadUrl): string;
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
export function refreshUrlsFromQiniuOSS(payload: ParamsQiniuOSSRefreshUrls): Promise<string[]>;
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
export function deleteRemotePathListFromQiniuOSS(payload: ParamsQiniuOSSDeleteRemotePathList): Promise<ReturnQiniuOSSDeleteRemotePathList>;
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
export function uploadLocalFileToQiniuOSS(payload: ParamsQiniuOSSUploadLocalFile): Promise<ReturnQiniuOSSUploadLocalFile>;
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
 */
export function uploadDirToQiniuOSS(payload: ParamsQiniuOSSUploadDir): Promise<ReturnQiniuOSSUploadDir>;
export type QiniuZoneName = "Zone_z0" | "Zone_z1" | "Zone_z2" | "Zone_na0" | "Zone_as0";
export type QiniuConfig = import("qiniu").conf.Config;
export type QiniuBucketManager = import("qiniu").rs.BucketManager;
export type QiniuMac = import("qiniu").auth.digest.Mac;
export type QiniuMacOptions = import("qiniu").auth.digest.MacOptions;
export type QiniuPutPolicyOptions = import("qiniu").rs.PutPolicyOptions;
export type QiniuListedObjectEntry = import("qiniu/StorageResponseInterface.d.ts").ListedObjectEntry;
export type QiniuListPrefixOptions = import("qiniu").rs.ListPrefixOptions;
export type QiniuHttpcResponseWrapper = import("qiniu").httpc.ResponseWrapper;
export type QiniuOperationResponse = import("qiniu/StorageResponseInterface.d.ts").OperationResponse;
export type ParamsQiniuOSSGetMac = {
    accessKey: string;
    secretKey: string;
    options?: qiniu.auth.digest.MacOptions | undefined;
};
export type ParamsQiniuOSSGetBucketManager = {
    mac: QiniuMac;
    config: QiniuConfig;
};
export type ParamsQiniuOSSGetPublicDownloadUrl = {
    bucketManager: QiniuBucketManager;
    key: string;
    baseUrl?: string | undefined;
};
export type ParamsQiniuOSSRefreshUrls = {
    urls: string[];
    mac: QiniuMac;
};
export type ParamsQiniuOSSDeleteRemotePathList = {
    bucketManager: QiniuBucketManager;
    remotePathList: string[];
    bucket: string;
};
export type ReturnQiniuOSSDeleteRemotePathList = {
    successItems: string[];
    failItems: string[];
};
export type ParamsQiniuOSSUploadLocalFile = {
    config: QiniuConfig;
    mac: QiniuMac;
    localPath: string;
    key: string;
    baseUrl: string;
    bucket: string;
    putPolicyOptions?: qiniu.rs.PutPolicyOptions | undefined;
};
export type ReturnQiniuOSSUploadLocalFile = {
    key: string;
    etag: string;
    fileSize: number;
    bucket: string;
    name: string;
    url: string;
};
export type QiniuOSSUploadFileCallback = (curIdx: number, total: number, file: ReturnQiniuOSSUploadLocalFile) => any;
export type ParamsQiniuOSSUploadDir = {
    config: QiniuConfig;
    mac: QiniuMac;
    bucket: string;
    /**
     * - needed if refresh is set true
     */
    baseUrl?: string | undefined;
    keyPrefix?: string | undefined;
    putPolicyOptions?: qiniu.rs.PutPolicyOptions | undefined;
    localPath: string;
    ignorePathList?: string[] | undefined;
    refresh?: boolean | undefined;
    recursive?: boolean | undefined;
    /**
     * - set to true if you want to check which files will be deployed before real deployment
     */
    dryRun?: boolean | undefined;
    /**
     * - callback function for upload progress
     */
    uploadCallback?: QiniuOSSUploadFileCallback | undefined;
};
export type QiniuOSSLocalPathAndKey = {
    localPath: string;
    key: string;
};
export type ReturnQiniuOSSUploadDir = {
    uploadedList: ReturnQiniuOSSUploadLocalFile[];
    refreshedUrlList: string[];
    allPaths: QiniuOSSLocalPathAndKey[];
};
export type QiniuHttpClientRawOptions = qiniu.httpc.HttpClientOptions;
export type QiniuHttpClientOptions = QiniuHttpClientRawOptions;
export type ParamsQiniuOSSListFiles = {
    bucketManager: QiniuBucketManager;
    bucket: string;
    options: QiniuListPrefixOptions;
};
import qiniu from "qiniu";
//# sourceMappingURL=UtilsQiniuOSS.d.mts.map