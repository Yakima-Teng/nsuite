import path from "path";
import { NodeSSH } from "node-ssh";
import type {
  NodeSSH as SSH,
  SSHGetPutDirectoryOptions,
  SSHPutFilesOptions,
} from "node-ssh";
import type { SFTPWrapper, TransferOptions } from "ssh2";

/**
 * Utilities functions for SSH
 *
 * @example
 * import {
 *   getSSHClient,
 *   sshConnect,
 *   joinPath,
 *   zipFolder,
 *   sshPutFile,
 *   sshExecCommand,
 * } from "nsuite";
 * import { PATH_ROOT } from "#scripts/ConstantUtils";
 * import { sshConfig } from "#hosts/Shanghai-Tencent/nginx/build/config";
 *
 * const sshClient = getSSHClient();
 * await sshConnect({
 *   ssh: sshClient,
 *   ...sshConfig,
 * });
 * const pathDist = joinPath(PATH_ROOT, "apps-home/blog", "dist");
 * const pathDistZip = joinPath(pathDist, "../dist.zip");
 * await zipFolder({
 *   pathFolder: pathDist,
 *   pathOutputFile: pathDistZip,
 * });
 *
 * const pathRemote = "/www/sites/www.example.com/public";
 * const pathRemoteZip = `${pathRemote}/dist.zip`;
 * await sshPutFile({
 *   ssh: sshClient,
 *   localFile: pathDistZip,
 *   remoteFile: pathRemoteZip,
 * });
 *
 * const execCommand = async (command: string): Promise<void> => {
 *   await sshExecCommand({
 *     ssh: sshClient,
 *     cwd: pathRemote,
 *     command,
 *   });
 * };
 * await execCommand("rm dist");
 * await execCommand("unzip -o dist.zip");
 * await execCommand("rm dist.zip");
 *
 * process.exit(0);
 */

/**
 * Get SSH instance
 */
export interface PathPair {
  local: string;
  remote: string;
}

export interface ParamsConnect {
  ssh: SSH;
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface ParamsPutDir {
  ssh: SSH;
  fromPath: string;
  toPath: string;
  options?: SSHGetPutDirectoryOptions;
  uploadCallback?: (local: string, remote: string, error: Error | null) => void;
}

export interface ReturnPutDir {
  success: boolean;
  failItems: PathPair[];
  successItems: PathPair[];
}

export interface ParamsSSHGetDir {
  ssh: SSH;
  localDirectory: string;
  remoteDirectory: string;
  options?: SSHGetPutDirectoryOptions;
}

export interface ParamsSSHGetFile {
  ssh: SSH;
  localFile: string;
  remoteFile: string;
  givenSftp?: SFTPWrapper | null;
  transferOptions?: TransferOptions;
}

export interface ParamsPutFiles {
  ssh: SSH;
  files: PathPair[];
  options?: SSHPutFilesOptions;
}

export interface ParamsExecCommand {
  ssh: SSH;
  cwd: string;
  command: string;
  onStdout?: (chunk: Buffer) => void;
  onStderr?: (chunk: Buffer) => void;
}

/**
 * Creates an SSH client that can be connected with {@link sshConnect}.
 *
 * @category SSH
 * @returns A disconnected `NodeSSH` client.
 */
export function getSSHClient(): SSH {
  return new NodeSSH();
}

/**
 * Connects an SSH client to a remote host.
 *
 * @category SSH
 * @param payload - The client and connection credentials.
 * @returns A promise that resolves after authentication succeeds.
 */
export async function sshConnect(payload: ParamsConnect): Promise<void> {
  const { ssh, ...config } = payload;
  await ssh.connect(config);
}

/**
 * Uploads a directory recursively and records every successful and failed file.
 *
 * @category SSH
 * @remarks `node_modules` is excluded unless a custom `validate` option changes
 * that behavior.
 * @param payload - The source, destination, and optional transfer settings.
 * @returns The overall result and individual transfer outcomes.
 */
export async function sshPutDirectory(
  payload: ParamsPutDir,
): Promise<ReturnPutDir> {
  const { ssh, fromPath, toPath, options, uploadCallback } = payload;
  const failItems: PathPair[] = [];
  const successItems: PathPair[] = [];
  const success = await ssh.putDirectory(fromPath, toPath, {
    recursive: true,
    concurrency: 10,
    validate(itemPath) {
      const baseName = path.basename(itemPath);
      return baseName !== "node_modules";
    },
    tick(local, remote, error) {
      if (typeof uploadCallback === "function") {
        uploadCallback(local, remote, error);
      }
      if (error) {
        failItems.push({ local, remote });
      } else {
        successItems.push({ local, remote });
      }
    },
    ...(options || {}),
  });

  return {
    success,
    failItems,
    successItems,
  };
}

/**
 * Downloads a remote directory to a local directory.
 *
 * @category SSH
 * @param payload - The connected client, local destination, and remote source.
 * @returns Whether the directory transfer completed successfully.
 */
export async function sshGetDirectory(
  payload: ParamsSSHGetDir,
): Promise<boolean> {
  const { ssh, localDirectory, remoteDirectory, options } = payload;
  return await ssh.getDirectory(localDirectory, remoteDirectory, options);
}

/**
 * Downloads one remote file through SFTP.
 *
 * @category SSH
 * @param payload - The connected client, source, destination, and SFTP options.
 * @returns A promise that resolves when the file is written locally.
 */
export async function sshGetFile(payload: ParamsSSHGetFile): Promise<void> {
  const { ssh, localFile, remoteFile, givenSftp, transferOptions } = payload;
  return await ssh.getFile(localFile, remoteFile, givenSftp, transferOptions);
}

/**
 * Uploads one local file through SFTP.
 *
 * @category SSH
 * @param payload - The connected client, source, destination, and SFTP options.
 * @returns A promise that resolves when the remote file is written.
 */
export async function sshPutFile(payload: ParamsSSHGetFile): Promise<void> {
  const { ssh, localFile, remoteFile, givenSftp, transferOptions } = payload;
  return await ssh.putFile(localFile, remoteFile, givenSftp, transferOptions);
}

/**
 * Uploads multiple local files through one SSH client.
 *
 * @category SSH
 * @param payload - The file pairs and optional transfer settings.
 * @returns A promise that resolves after all file transfers complete.
 */
export async function sshPutFiles(payload: ParamsPutFiles): Promise<void> {
  const { ssh, files, options } = payload;
  return ssh.putFiles(files, options);
}

/**
 * Executes a command in a remote working directory.
 *
 * @category SSH
 * @param payload - The connected client, command, working directory, and output callbacks.
 * @returns A promise that resolves after the command completes.
 */
export async function sshExecCommand(
  payload: ParamsExecCommand,
): Promise<void> {
  const { ssh, cwd, command, onStdout, onStderr } = payload;
  await ssh.execCommand(command, {
    cwd,
    onStdout(chunk) {
      if (typeof onStdout === "function") {
        onStdout(chunk);
      }
    },
    onStderr(chunk) {
      if (typeof onStderr === "function") {
        onStderr(chunk);
      }
    },
  });
}
