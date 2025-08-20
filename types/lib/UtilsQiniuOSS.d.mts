export function getMacFromQiniuOSS(payload: ParamsQiniuOSSGetMac): QiniuMac;
export function getConfigFromQiniuOSS(options: import("qiniu").conf.ConfigOptions): QiniuConfig;
export function getBucketManagerFromQiniuOSS(payload: ParamsQiniuOSSGetBucketManager): QiniuBucketManager;
export function getPublicDownloadUrlFromQiniuOSS(payload: ParamsQiniuOSSGetPublicDownloadUrl): string;
export function refreshUrlsFromQiniuOSS(payload: ParamsQiniuOSSRefreshUrls): Promise<string[]>;
export function deleteRemotePathListFromQiniuOSS(payload: ParamsQiniuOSSDeleteRemotePathList): Promise<ReturnQiniuOSSDeleteRemotePathList>;
export function uploadLocalFileToQiniuOSS(payload: ParamsQiniuOSSUploadLocalFile): Promise<ReturnQiniuOSSUploadLocalFile>;
export function uploadDirToQiniuOSS(payload: ParamsQiniuOSSUploadDir): Promise<ReturnQiniuOSSUploadDir>;
export type QiniuZoneName = keyof typeof import("qiniu").zone;
export type QiniuConfig = import("qiniu").conf.Config;
export type QiniuBucketManager = import("qiniu").rs.BucketManager;
export type QiniuMac = import("qiniu").auth.digest.Mac;
export type QiniuMacOptions = import("qiniu").auth.digest.MacOptions;
export type QiniuPutPolicyOptions = import("qiniu").rs.PutPolicyOptions;
export type QiniuListedObjectEntry = any;
export type QiniuListPrefixOptions = import("qiniu").rs.ListPrefixOptions;
export type QiniuHttpcResponseWrapper = import("qiniu").httpc.ResponseWrapper;
export type QiniuOperationResponse = any;
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
export type ParamsQiniuOSSListFiles = {
    bucketManager: QiniuBucketManager;
    bucket: string;
    options: QiniuListPrefixOptions;
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
export type ReturnQiniuOSSUploadDir = {
    uploadedList: ReturnQiniuOSSUploadLocalFile[];
    refreshedUrlList: string[];
    allPaths: {
        localPath: string;
        key: string;
    }[];
};
import qiniu from "qiniu";
//# sourceMappingURL=UtilsQiniuOSS.d.mts.map