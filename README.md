# nsuite

<p align="center" style="display: flex;align-items: center;justify-content: center;gap:8px;">
  <a href="https://npmcharts.com/compare/nsuite?minimal=true">
    <img src="https://img.shields.io/npm/dm/nsuite.svg" alt="Downloads">
  </a>
  <a href="https://www.npmjs.com/package/nsuite">
    <img src="https://img.shields.io/npm/v/nsuite.svg" alt="Version">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-√-blue" alt="Support Typescript">
  </a>
  <a href="https://jsdoc.app/">
    <img src="https://img.shields.io/badge/JSDoc-√-red" alt="Support JSDoc">
  </a>
  <a href="https://github.com/Yakima-Teng/nsuite/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/nsuite.svg" alt="License">
  </a>
  <a href="https://github.com/Yakima-Teng/nsuite">
    <img src="https://img.shields.io/github/stars/Yakima-Teng/nsuite.svg?style=social"
      alt="Stars">
  </a>
</p>

> Your missing nodejs development suite! Give it a star if you find this
> package useful ^\_^.

If you develop with Node.js, you will find that there are **many many many**
functions/packages you need to write/install across **many** projects.
nsuite will make you feel more comfortable.
After install with `npm i -S nsuite`, you will have all the following
abilities at your hand.

**TypeScript is supported.**

## Documentation

For online documentation, please visit [https://yakima-teng.github.io/nsuite/](https://yakima-teng.github.io/nsuite/).

## Env

- `parseEnvFiles` — Parses environment files using dotenv.

## Path

- `getFilePath` — Converts `import.meta.url` to a file path.
- `getDirname` — Returns the directory name from `import.meta.url`.
- `joinPath` — Joins multiple path segments into a single path.
- `joinPosixPath` — Joins multiple path segments into a single POSIX path.
- `resolvePath` — Resolves path segments to an absolute path.
- `resolvePosixPath` — Resolves path segments to an absolute POSIX path.
- `isPathExists` — Checks if a given path exists.
- `globMatchPaths` — Matches file paths using glob patterns.

## Promise

- `withTimeout` — Wraps a promise with a configurable timeout.

## Log

- `createLogger` — Creates a Winston logger with daily rotating file transport.
- `logInfo` — Logs an informational message to the console.
- `logWarn` — Logs a warning message to the console.
- `logError` — Logs an error message to the console.

## File

- `getSafeFileName` — Sanitizes a file name by replacing special characters.
- `zipFile` — Compresses a single file into a zip archive.
- `zipFolder` — Compresses a folder into a zip archive.
- `unzipFile` — Extracts a zip archive to a directory.
- `getFileMd5` — Calculates the MD5 hash of a file.
- `getReadableFileSize` — Converts file size in bytes to a human-readable string.
- `writeFileSafely` — Writes content to a file, creating parent directories if needed.

## SSH

- `getSSHClient` — Creates a new SSH client instance.
- `sshConnect` — Connects to a remote server via SSH.
- `sshPutDirectory` — Uploads a local directory to a remote server via SSH.
- `sshGetDirectory` — Downloads a remote directory from a server via SSH.
- `sshGetFile` — Downloads a remote file from a server via SSH.
- `sshPutFile` — Uploads a local file to a remote server via SSH.
- `sshPutFiles` — Uploads multiple local files to a remote server via SSH.
- `sshExecCommand` — Executes a command on a remote server via SSH.

## Type

- `getError` — Safely wraps an unknown error into an Error instance.

## Debug

- `attachLogToFunc` — Wraps a function with debug logging for arguments
  and return value.

## Captcha

- `generateSvgCaptcha` — Generates an SVG captcha with a mathematical expression.

## Text

- `generateSummary` — Generates a text summary using OpenAI's chat completions API.

## Module

- `isMainModule` — Checks if the current module is the Node.js entry point.

## Qiniu OSS

- `getConfigFromQiniuOSS` — Creates a Qiniu configuration object.
- `getMacFromQiniuOSS` — Creates a Qiniu Mac authentication object.
- `getBucketManagerFromQiniuOSS` — Creates a Qiniu bucket manager instance.
- `getPublicDownloadUrlFromQiniuOSS` — Generates a public download URL
  for a Qiniu object.
- `refreshUrlsFromQiniuOSS` — Refreshes CDN cache URLs via Qiniu.
- `deleteRemotePathListFromQiniuOSS` — Deletes multiple files from Qiniu OSS.
- `uploadLocalFileToQiniuOSS` — Uploads a single local file to Qiniu OSS.
- `uploadDirToQiniuOSS` — Uploads an entire directory to Qiniu OSS.

## Aliyun OSS

- `getClientFromAliOSS` — Creates an Aliyun OSS client instance.
- `getObjectUrlFromAliOSS` — Generates an object URL from Aliyun OSS.
- `listFilesFromAliOSS` — Lists files under a prefix in Aliyun OSS.
- `deleteRemotePathListFromAliOSS` — Deletes multiple files from Aliyun OSS.
- `uploadLocalFileToAliOSS` — Uploads a single local file to Aliyun OSS.
- `uploadDirToAliOSS` — Uploads an entire directory to Aliyun OSS.

## License

📄 [Apache License 2.0](https://github.com/Yakima-Teng/nsuite/blob/master/LICENSE)
