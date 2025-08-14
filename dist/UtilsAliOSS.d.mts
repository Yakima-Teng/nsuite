export function initConfig(options: IOptions): void;
type TInitConfig = (options: IOptions) => void;
export function deleteRemotePathList(remotePathList: string[]): Promise<{
    successItems: string[];
    failItems: string[];
}>;
type TDeleteRemotePathList = (remotePathList: string[]) => Promise<{
    successItems: string[];
    failItems: string[];
}>;
export function uploadLocalFile({ localPath, relativePath, config, }: IPayloadUploadLocalFile): Promise<IReturnUploadLocalFile>;
type TUploadLocalFile = ({ localPath, relativePath, config, }: IPayloadUploadLocalFile) => Promise<IReturnUploadLocalFile>;
export function uploadDir({ fromPath, ignore, recursive, }: IPayloadUploadDir): Promise<IReturnUploadLocalFile[]>;
type TUploadDir = ({ fromPath, ignore, recursive, }: IPayloadUploadDir) => Promise<IReturnUploadLocalFile[]>;
interface IOptions {
    accessKey: string;
    secretKey: string;
    bucketName: string;
    zoneName: string;
    publicBucketDomain: string;
    uploadRemotePath: string;
}
interface IPayloadUploadLocalFile {
    localPath: string;
    relativePath: string;
    config?: {
        headers?: Record<string, unknown>;
    };
}
interface IReturnUploadLocalFile {
    name: string;
    url: string;
    cdnUrl: string;
}
interface IPayloadUploadDir {
    fromPath: string;
    ignore?: string[];
    recursive?: boolean;
}
export {};
//# sourceMappingURL=UtilsAliOSS.d.mts.map