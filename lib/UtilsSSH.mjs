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
  const { ssh, config } = payload;
  await ssh.connect(config);
};

/**
 * @typedef {Object} ParamsPutDir
 * @property {SSH} ssh
 * @property {string} fromPath
 * @property {string} toPath
 * @property {GetPutDirectoryOptions} [options]
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
  const { ssh, fromPath, toPath, options } = payload;
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
