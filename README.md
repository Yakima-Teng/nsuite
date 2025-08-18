# nsuite

> Your missing nodejs development suite!

If you develop with Node.js, you will find that there are **many many many** functions/packages you need to write/install across **many** projects.
nsuite will make you feel more comfortable.
After install with `npm i -S nsuite`, you will have all the following abilities at your hand.

**TypeScript is supported.**

## Env

### parseEnvFiles

```js
import { parseEnvFiles } from "nsuite";

// note: the first value set for a varialble will win
parseEnvFiles([
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
]);
```

## Path

```js
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

```js
import { withTimeout } from "nsuite";
const newPromise = withTimeout(promise, 3000);
```

## Log

### createLogger

```js
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

```js
import { getSafeFileName } from "nsuite";
const safeFileName = getSafeFileName("测试有空格 和特殊符号 &.pdf");
```

## Captcha

### generateSvgCaptcha

```js
import { generateSvgCaptcha } from "nsuite";
const { text, data } = await generateSvgCaptcha({
  width: 148,
  height: 48,
});
```

## Text

### generateSummary

Generate a summary of given text.

```js
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

## License

This project is published under MIT license, which means you can use it in business projects for free. However, it would be better if you give this repo a star!
