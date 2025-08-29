# nsuite

> Your missing nodejs development suite!

If you develop with Node.js, you will find that there are **many many many** functions/packages you need to write/install across **many** projects.
nsuite will make you feel more comfortable.
After install with `npm i -S nsuite`, you will have all the following abilities at your hand.

**TypeScript is supported.**

## Env

### parseEnvFiles

```typescript
import { parseEnvFiles } from "nsuite";

// note: the first value set for a varialble will win
parseEnvFiles([
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
]);
```

## Path

```typescript
import {
  getFilePath,
  getDirname,
  joinPath,
  isPathExists,
  globMatchPaths,
} from "nsuite";

const __filename = getFilePath(import.meta.url);
const __dirname = getDirname(import.meta.url);

const targetPath = joinPath(__dirname, "../", "package.json");
const isExists = await isPathExists(targetPath);
const excelFileList = await globMatchPaths(
  joinPath(__dirname, "materials/*.xlsx"),
);
```

## Promise

### withTimeout

```typescript
import { withTimeout } from "nsuite";
const newPromise = withTimeout(promise, 3000);
```

## Log

### createLogger

```typescript
import { createLogger } from "nsuite";
export const logger = createLogger({
  level: "info",
  meta: {
    serverName: "your-server-name",
    NODE_ENV: process.env.NODE_ENV,
    MODE: process.env.MODE,
  },
  maxLength: 1000,
  filename: "./logs/application-%DATE%.log",
  zippedArchive: false,
  enableConsole: process.env.NODE_ENV !== "production",
});
```

## File

### getSafeFileName

Get a safe file name which you can use it in url after encodeURI handling.

```typescript
import { getSafeFileName } from "nsuite";
const safeFileName = getSafeFileName("测试有空格 和特殊符号 &.pdf");
```

### zipFile

Zips a single file and returns a promise that resolves when the zip operation is complete.

```typescript
import { zipFile } from "nsuite";
await zipFile({
  pathInputFile: "./package.json",
  pathOutputFile: "./package.json.zip",
});
```

### zipFolder

Zips a folder and returns a promise that resolves when the zip operation is complete.

```typescript
import { zipFolder } from "nsuite";
await zipFolder({
  pathFolder: "./dist",
  pathOutputFile: "./dist.zip",
});
```

### getFileMd5

Calculates the MD5 hash of a file and returns a promise that resolves with the hash.

```typescript
import { getFileMd5 } from "nsuite";
const md5 = await getFileMd5({ pathFile: "./package.json" });
```

## Captcha

### generateSvgCaptcha

```typescript
import { generateSvgCaptcha } from "nsuite";
const { text, data } = await generateSvgCaptcha({
  width: 148,
  height: 48,
});
```

## Text

### generateSummary

Generate a summary of given text.

```typescript
import { generateSummary } from "nsuite";
const summary = generateSummary({
  apiKey: "",
  baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  model: "qwen-turbo",
  language: "English",
  maxWords: 200,
  content: "",
});
```

## Qiniu OSS

```typescript
import {
  getConfigFromQiniuOSS,
  getMacFromQiniuOSS,
  joinPath,
  refreshUrlsFromQiniuOSS,
  uploadDirToQiniuOSS,
} from "nsuite";

const mac = getMacFromQiniuOSS({
  accessKey: QINIU_ACCESS_KEY,
  secretKey: QINIU_SECRET_KEY,
});
const config = getConfigFromQiniuOSS({});
const { uploadedList } = await uploadDirToQiniuOSS({
  config,
  mac,
  bucket: QINIU_BUCKET_NAME,
  baseUrl: QINIU_PUBLIC_BUCKET_DOMAIN,
  keyPrefix: CDN_PATH_PREFIX,
  putPolicyOptions: {
    scope: QINIU_BUCKET_NAME,
    expires: 7200,
  },
  localPath: PATH_PUBLIC,
  ignorePathList: ["node_modules/**"],
  refresh: false,
  recursive: true,
  dryRun: false,
  uploadCallback: (curIdx, totalCount, fileInfo) => {
    logger.info(`Uploaded ${curIdx + 1}/${totalCount} ${fileInfo.key}`);
  },
});

const urlsToRefresh = uploadedList
  .filter((item) => {
    return item.key.endsWith(".css") || item.key.endsWith(".js");
  })
  .map((item) => item.url);

logger.info(`Start refreshing CDN: ${urlsToRefresh.join(", ")}.`);
const refreshedUrls = await refreshUrlsFromQiniuOSS({
  urls: urlsToRefresh,
  mac,
});

logger.info(`Refreshed urls: ${refreshedUrls.join(", ")}.`);
```

## Aliyun OSS

```typescript
import {
  getClientFromAliOSS,
  getObjectUrlFromAliOSS,
  listFilesFromAliOSS,
  deleteRemotePathListFromAliOSS,
  uploadLocalFileToAliOSS,
  uploadDirToAliOSS,
} from "nsuite";
```

## SSH

```typescript
import {
  getSSHClient,
  sshConnect,
  joinPath,
  zipFolder,
  sshPutFile,
  sshExecCommand,
} from "nsuite";
import { PATH_ROOT } from "#scripts/ConstantUtils";
import { sshConfig } from "#hosts/Shanghai-Tencent/nginx/build/config";

const sshClient = getSSHClient();
await sshConnect({
  ssh: sshClient,
  ...sshConfig,
});
const pathDist = joinPath(PATH_ROOT, "apps-home/blog", "dist");
const pathDistZip = joinPath(pathDist, "../dist.zip");
await zipFolder({
  pathFolder: pathDist,
  pathOutputFile: pathDistZip,
});

const pathRemote = "/www/sites/www.orzzone.com/public";
const pathRemoteZip = `${pathRemote}/dist.zip`;
await sshPutFile({
  ssh: sshClient,
  localFile: pathDistZip,
  remoteFile: pathRemoteZip,
});
await sshExecCommand({
  ssh: sshClient,
  cwd: pathRemote,
  command: "unzip -o dist.zip",
  onStdout: (chunk) => {
    // eslint-disable-next-line no-console
    console.log(chunk.toString().substring(0, 200));
  },
  onStderr: (chunk) => {
    console.error(chunk.toString().substring(0, 200));
  },
});

process.exit(0);
```

## License

This project is published under MIT license, which means you can use it in business projects for free. However, it would be better if you give this repo a star!
