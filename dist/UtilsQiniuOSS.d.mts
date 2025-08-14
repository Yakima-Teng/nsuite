export function initConfig(options: IOptions): void;
type TInitConfig = (options: IOptions) => void;
export function refreshCDN(urlsToRefresh: string[]): Promise<string[]>;
type TRefreshCDN = (urlsToRefresh: string[]) => Promise<string[]>;
export function deleteRemotePathList(remotePathList: string[]): Promise<{
    successItems: string[];
    failItems: string[];
}>;
type TDeleteRemotePathList = (remotePathList: string[]) => Promise<{
    successItems: string[];
    failItems: string[];
}>;
export function uploadDir({ fromPath, ignore, refresh, recursive, }: IPayloadUploadDir): Promise<IReturnUploadLocalFileToQiNiu[]>;
type TUploadDir = ({ fromPath, ignore, refresh, recursive, }: IPayloadUploadDir) => Promise<IReturnUploadLocalFileToQiNiu[]>;
interface IOptions {
    accessKey: string;
    secretKey: string;
    bucketName: string;
    zoneName: keyof typeof qiniu.zone;
    publicBucketDomain: string;
    uploadRemotePrefix: string;
}
interface IPayloadUploadDir {
    fromPath: string;
    ignore?: string[];
    refresh: boolean;
    recursive?: boolean;
}
interface IReturnUploadLocalFileToQiNiu {
    key: string;
    etag: string;
    fileSize: string;
    bucket: string;
    name: string;
}
import qiniu from 'qiniu';
export {};
//# sourceMappingURL=UtilsQiniuOSS.d.mts.map