# Files and Paths

Use the path helpers to keep ESM file locations explicit, then compose the file
helpers around those paths.

## Resolve paths from an ESM module

```ts
import { getDirname, getFilePath, joinPath } from "nsuite";

const currentFile = getFilePath(import.meta.url);
const currentDirectory = getDirname(import.meta.url);
const outputPath = joinPath(currentDirectory, "dist", "report.json");
```

## Write an output file safely

`writeFileSafely` creates missing parent directories before writing the file.
It is useful for scripts that produce artifacts in a nested output directory.

```ts
import { writeFileSafely } from "nsuite";

await writeFileSafely("./dist/reports/summary.txt", "Build complete.", {
  encoding: "utf8",
});
```

## Archive artifacts

Use `zipFolder` to create an archive and `unzipFile` to extract one. Read the
[API Reference](/api/) for the complete input and output contracts.
