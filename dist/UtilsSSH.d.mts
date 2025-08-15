export function getSSHClient(): SSH;
export function sshConnect(payload: ParamsConnect): Promise<void>;
export function sshPutDirectory(payload: ParamsPutDir): Promise<ReturnPutDir>;
export function sshPutFiles(payload: ParamsPutFiles): Promise<void>;
export function sshExecCommand(payload: ParamsExecCommand): Promise<void>;
export type SSH = import("node-ssh").NodeSSH;
export type GetPutDirectoryOptions = import("node-ssh").SSHGetPutDirectoryOptions;
export type PutFilesOptions = import("node-ssh").SSHPutFilesOptions;
export type PathPair = {
    local: string;
    remote: string;
};
export type ParamsConnect = {
    host: string;
    port: number;
    username: string;
    password: string;
};
export type ParamsPutDir = {
    ssh: SSH;
    fromPath: string;
    toPath: string;
    options?: GetPutDirectoryOptions;
};
export type ReturnPutDir = {
    success: boolean;
    failItems: PathPair[];
    successItems: PathPair[];
};
export type ParamsPutFiles = {
    ssh: SSH;
    files: PathPair[];
    options?: PutFilesOptions;
};
export type ParamsExecCommand = {
    ssh: SSH;
    cwd: string;
    command: string;
    onStdout?: (chunk: Buffer) => void;
    onStderr?: (chunk: Buffer) => void;
};
//# sourceMappingURL=UtilsSSH.d.mts.map