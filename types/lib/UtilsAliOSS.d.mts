export function getClientFromAliOSS(payload: ParamsAliOSSConstructor): AliOSSClient;
export function getObjectUrlFromAliOSS(payload: ParamsAliOSSGetObjectUrl): string;
export function listFilesFromAliOSS(payload: ParamsAliOSSListFiles): Promise<AliObjectMeta[]>;
export function deleteRemotePathListFromAliOSS(payload: ParamsAliDeleteRemotePathList): Promise<ReturnAliDeleteRemotePathList>;
export function uploadLocalFileToAliOSS(payload: ParamsUploadLocalFile): Promise<ReturnUploadLocalFile>;
export function uploadDirToAliOSS(payload: ParamsUploadDirToAliOSS): Promise<ReturnUploadLocalFile[]>;
export type AliOSSClient = import("ali-oss");
export type ParamsAliOSSConstructor = {
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    region: string;
};
export type ParamsAliOSSGetObjectUrl = {
    client: AliOSSClient;
    key: string;
    /**
     * 一般为CDN加速域名，以http(s)开头
     */
    baseUrl?: string | undefined;
};
export type AliRequestOptions = import("ali-oss").RequestOptions;
export type AliObjectMeta = import("ali-oss").ObjectMeta;
export type ParamsAliOSSListFiles = {
    client: AliOSSClient;
    prefix: string;
    /**
     * max objects, default is 100, limit to 1000, set it to 0 or ignore it if you want to list all files
     */
    maxKeys?: number | undefined;
    options?: OSS.RequestOptions | undefined;
};
export type ParamsAliDeleteRemotePathList = {
    client: AliOSSClient;
    remotePathList: string[];
};
export type ReturnAliDeleteRemotePathList = {
    successItems: string[];
    failItems: string[];
};
export type ParamsUploadLocalFile = {
    client: AliOSSClient;
    localPath: string;
    remotePath: string;
    baseUrl?: string | undefined;
    config?: OSS.PutObjectOptions | undefined;
};
export type ReturnUploadLocalFile = {
    name: string;
    url: string;
    cdnUrl: string;
};
export type ParamsUploadDirToAliOSS = {
    client: AliOSSClient;
    localPath: string;
    ignorePathList: string[];
    recursive?: boolean | undefined;
};
import OSS from "ali-oss";
//# sourceMappingURL=UtilsAliOSS.d.mts.map