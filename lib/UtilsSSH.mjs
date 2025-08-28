import { NodeSSH } from "node-ssh";
import path from "path";

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
export const getSSHClient = () => {
  return new NodeSSH();
};

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
export const sshConnect = async (payload) => {
  const { ssh, ...config } = payload;
  await ssh.connect(config);
};

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
export const sshPutDirectory = async (payload) => {
  const { ssh, fromPath, toPath, options, uploadCallback } = payload;
  /** @type {PathPair[]} */
  const failItems = [];
  /** @type {PathPair[]} */
  const successItems = [];
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
};

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
export const sshGetDirectory = async (payload) => {
  const { ssh, localDirectory, remoteDirectory, options } = payload;
  return await ssh.getDirectory(localDirectory, remoteDirectory, options);
};

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
export const sshGetFile = async (payload) => {
  const { ssh, localFile, remoteFile, givenSftp, transferOptions } = payload;
  return await ssh.getFile(localFile, remoteFile, givenSftp, transferOptions);
};

/**
 * Put file to server
 * @param {ParamsSSHGetFile} payload
 * @returns {Promise<void>}
 */
export const sshPutFile = async (payload) => {
  const { ssh, localFile, remoteFile, givenSftp, transferOptions } = payload;
  return await ssh.putFile(localFile, remoteFile, givenSftp, transferOptions);
};

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
export const sshPutFiles = async (payload) => {
  const { ssh, files, options } = payload;
  return ssh.putFiles(files, options);
};

/**
 * @typedef {Object} ParamsExecCommand
 * @property {SSH} ssh
 * @property {string} cwd
 * @property {string} command
 * @property {(chunk: Buffer) => void} [onStdout]
 * @property {(chunk: Buffer) => void} [onStderr]
 */

/**
 * Execute command
 * @param {ParamsExecCommand} payload
 * @returns {Promise<void>}
 */
export const sshExecCommand = async (payload) => {
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
};
