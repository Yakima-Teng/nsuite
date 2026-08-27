# 文件与路径

先使用路径工具明确 ESM 模块的位置，再围绕这些路径组合文件操作工具。

## 从 ESM 模块解析路径

```ts
import { getDirname, getFilePath, joinPath } from "nsuite";

const currentFile = getFilePath(import.meta.url);
const currentDirectory = getDirname(import.meta.url);
const outputPath = joinPath(currentDirectory, "dist", "report.json");
```

## 安全写入输出文件

`writeFileSafely` 会在写入前创建不存在的父目录，适用于需要向嵌套输出目录生成构建产物的脚本。

```ts
import { writeFileSafely } from "nsuite";

await writeFileSafely("./dist/reports/summary.txt", "Build complete.", {
  encoding: "utf8",
});
```

## 压缩构建产物

使用 `zipFolder` 创建压缩包，使用 `unzipFile` 解压。完整的输入、输出类型请查看[英文 API 参考](/api/)。
