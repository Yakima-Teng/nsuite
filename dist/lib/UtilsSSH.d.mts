/**
 * @typedef {import('node-ssh').NodeSSH} SSH
 * @typedef {import('node-ssh').SSHGetPutDirectoryOptions} GetPutDirectoryOptions
 * @typedef {import('node-ssh').SSHPutFilesOptions} PutFilesOptions
 */
/**
 * @typedef {Object} PathPair
 * @property {string} local
 * @property {string} remote
 */
/**
 * Get SSH instance
 * @returns {SSH}
 */
export function getSSHClient(): SSH;
/**
 * @typedef {Object} ParamsConnect
 * @property {SSH} ssh
 * @property {string} host
 * @property {number} port
 * @property {string} username
 * @property {string} password
 */
/**
 * Connect to SSH
 * @param {ParamsConnect} payload
 * @returns {Promise<void>}
 */
export function sshConnect(payload: ParamsConnect): Promise<void>;
/**
 * @callback SSHUploadFileCallback
 * @param {string} local
 * @param {string} remote
 * @param {Error | null} error
 */
/**
 * @typedef {Object} ParamsPutDir
 * @property {SSH} ssh
 * @property {string} fromPath
 * @property {string} toPath
 * @property {GetPutDirectoryOptions} [options]
 * @property {SSHUploadFileCallback} [uploadCallback] - callback function for upload progress
 */
/**
 * @typedef {Object} ReturnPutDir
 * @property {boolean} success
 * @property {PathPair[]} failItems
 * @property {PathPair[]} successItems
 */
/**
 * Put directory
 * @param {ParamsPutDir} payload
 * @returns {Promise<ReturnPutDir>}
 */
export function sshPutDirectory(payload: ParamsPutDir): Promise<ReturnPutDir>;
/**
 * @typedef {Object} ParamsSSHGetDir
 * @property {SSH} ssh
 * @property {string} localDirectory
 * @property {string} remoteDirectory
 * @property {GetPutDirectoryOptions} [options]
 */
/**
 * Download directory from remote server
 * @param { ParamsSSHGetDir } payload
 * @returns {Promise<boolean>}
 */
export function sshGetDirectory(payload: ParamsSSHGetDir): Promise<boolean>;
/**
 * @typedef {Object} ParamsSSHGetFile
 * @property {SSH} ssh
 * @property {string} localFile
 * @property {string} remoteFile
 * @property {import('ssh2').SFTPWrapper | null} [givenSftp]
 * @property {import('ssh2').TransferOptions} [transferOptions]
 */
/**
 * Download file from server
 * @param {ParamsSSHGetFile} payload
 * @returns {Promise<void>}
 */
export function sshGetFile(payload: ParamsSSHGetFile): Promise<void>;
/**
 * Put file to server
 * @param {ParamsSSHGetFile} payload
 * @returns {Promise<void>}
 */
export function sshPutFile(payload: ParamsSSHGetFile): Promise<void>;
/**
 * @typedef {Object} ParamsPutFiles
 * @property {SSH} ssh
 * @property {PathPair[]} files
 * @property {PutFilesOptions} [options]
 */
/**
 * Put files
 * @param {ParamsPutFiles} payload
 * @returns {Promise<void>}
 */
export function sshPutFiles(payload: ParamsPutFiles): Promise<void>;
/**
 * @typedef {Object} ParamsExecCommand
 * @property {SSH} ssh
 * @property {string} cwd
 * @property {string} command
 * @property {function(Buffer): void} [onStdout]
 * @property {function(Buffer): void} [onStderr]
 */
/**
 * Execute command
 * @param {ParamsExecCommand} payload
 * @returns {Promise<void>}
 */
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
export type SSHUploadFileCallback = (local: string, remote: string, error: Error | null) => any;
export type ParamsPutDir = {
    ssh: SSH;
    fromPath: string;
    toPath: string;
    options?: import("node-ssh").SSHGetPutDirectoryOptions | undefined;
    /**
     * - callback function for upload progress
     */
    uploadCallback?: SSHUploadFileCallback | undefined;
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
    onStdout?: ((arg0: Buffer) => void) | undefined;
    onStderr?: ((arg0: Buffer) => void) | undefined;
};
//# sourceMappingURL=UtilsSSH.d.mts.map