# nsuite

> Your missing **n**odejs development **suite**!

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

## License

This project is published under MIT license, which means you can use it in business projects for free. However, it would be better if you give this repo a star!
