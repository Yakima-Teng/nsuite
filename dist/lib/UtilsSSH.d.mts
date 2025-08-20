export function getSSHClient(): SSH;
export function sshConnect(payload: ParamsConnect): Promise<void>;
export function sshPutDirectory(payload: ParamsPutDir): Promise<ReturnPutDir>;
export function sshGetDirectory(payload: ParamsSSHGetDir): Promise<boolean>;
export function sshGetFile(payload: ParamsSSHGetFile): Promise<void>;
export function sshPutFile(payload: ParamsSSHGetFile): Promise<void>;
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
    ssh: SSH;
    host: string;
    port: number;
    username: string;
    password: string;
};
export type ParamsPutDir = {
    ssh: SSH;
    fromPath: string;
    toPath: string;
    options?: import("node-ssh").SSHGetPutDirectoryOptions | undefined;
};
export type ReturnPutDir = {
    success: boolean;
    failItems: PathPair[];
    successItems: PathPair[];
};
export type ParamsSSHGetDir = {
    ssh: SSH;
    localDirectory: string;
    remoteDirectory: string;
    options?: import("node-ssh").SSHGetPutDirectoryOptions | undefined;
};
export type ParamsSSHGetFile = {
    ssh: SSH;
    localFile: string;
    remoteFile: string;
    givenSftp?: import("ssh2").SFTPWrapper | null | undefined;
    transferOptions?: import("ssh2").TransferOptions | undefined;
};
export type ParamsPutFiles = {
    ssh: SSH;
    files: PathPair[];
    options?: import("node-ssh").SSHPutFilesOptions | undefined;
};
export type ParamsExecCommand = {
    ssh: SSH;
    cwd: string;
    command: string;
    onStdout?: ((chunk: Buffer) => void) | undefined;
    onStderr?: ((chunk: Buffer) => void) | undefined;
};
//# sourceMappingURL=UtilsSSH.d.mts.map