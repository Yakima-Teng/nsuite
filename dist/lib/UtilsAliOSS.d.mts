/**
 * Utility functions for ali-oss
 * @module OSS-Ali
 */
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
export function getClientFromAliOSS(payload: ParamsAliOSSConstructor): AliOSSClient;
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
export function getObjectUrlFromAliOSS(payload: ParamsAliOSSGetObjectUrl): string;
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
export function listFilesFromAliOSS(payload: ParamsAliOSSListFiles): Promise<AliObjectMeta[]>;
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
export function deleteRemotePathListFromAliOSS(payload: ParamsAliDeleteRemotePathList): Promise<ReturnAliDeleteRemotePathList>;
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
export function uploadLocalFileToAliOSS(payload: ParamsUploadLocalFile): Promise<ReturnUploadLocalFile>;
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