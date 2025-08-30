import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "node:path";
import { rm } from "node:fs/promises";

import {
  zipFile,
  zipFolder,
  unzipFile,
  getDirname,
  getFilePath,
  isPathExists,
  getReadableFileSize,
  joinPath,
} from "#lib/index";

const filePath = getFilePath(import.meta.url);
const __dirname = getDirname(import.meta.url);
const parseResult = parse(filePath);
// base = name + ext
const basename = parseResult.base;
const filename = parseResult.name;

const pathTemp = joinPath(__dirname, "../.temp");

const assertUnzipFileSuccessfully = async (pathDest: string) => {
  await unzipFile({
    pathFile: pathDest,
    pathOutput: pathTemp,
  });
  const exists2 = await isPathExists(joinPath(pathTemp, basename));
  assert.equal(exists2, true);
};

test("zipFile and unzipFile", async () => {
  await rm(pathTemp, { recursive: true, force: true });
  const pathSrc = joinPath(__dirname, basename);
  const pathDest = joinPath(pathTemp, `${filename}.zip`);
  await zipFile({
    pathInputFile: pathSrc,
    pathOutputFile: pathDest,
  });
  const exists = await isPathExists(pathDest);
  assert.equal(exists, true);

  await assertUnzipFileSuccessfully(pathDest);

  await rm(pathTemp, { recursive: true, force: true });
});

test("zipFolder and unzipFile", async () => {
  await rm(pathTemp, { recursive: true, force: true });
  const pathSrc = joinPath(__dirname);
  const pathDest = joinPath(pathTemp, "dist.zip");
  await zipFolder({
    pathFolder: pathSrc,
    pathOutputFile: pathDest,
  });
  const exists = await isPathExists(pathDest);
  assert.equal(exists, true);

  await assertUnzipFileSuccessfully(pathDest);

  await rm(pathTemp, { recursive: true, force: true });
});

test("getReadableFileSize", () => {
  assert.equal(getReadableFileSize(0), "0 B");
  assert.equal(getReadableFileSize(1024, { standard: "jedec" }), "1 KB");
  assert.equal(getReadableFileSize(1024 * 1024, { standard: "jedec" }), "1 MB");
  assert.equal(
    getReadableFileSize(1024 * 1024 * 1024, { standard: "jedec" }),
    "1 GB",
  );
  assert.equal(
    getReadableFileSize(1024 * 1024 * 1024 * 1024, { standard: "jedec" }),
    "1 TB",
  );
  assert.equal(
    getReadableFileSize(1024 * 1024 * 1024 * 1024 * 1024, {
      standard: "jedec",
    }),
    "1 PB",
  );
  assert.equal(
    getReadableFileSize(1024 * 1024 * 1024 * 1024 * 1024 * 1024, {
      standard: "jedec",
    }),
    "1 EB",
  );
  assert.equal(
    getReadableFileSize(1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024, {
      standard: "jedec",
    }),
    "1 ZB",
  );
  assert.equal(
    getReadableFileSize(1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024, {
      standard: "jedec",
    }),
    "1 YB",
  );
  assert.equal(
    getReadableFileSize(
      1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
      { standard: "jedec" },
    ),
    "1024 YB",
  );
  assert.equal(
    getReadableFileSize(
      1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
      { standard: "jedec" },
    ),
    "1048576 YB",
  );

  assert.equal(getReadableFileSize(1000), "1 kB");
  assert.equal(getReadableFileSize(1001), "1 kB");
  assert.equal(getReadableFileSize(1010), "1.01 kB");
  assert.equal(getReadableFileSize(1100), "1.1 kB");
  assert.equal(getReadableFileSize(1024), "1.02 kB");
  assert.equal(getReadableFileSize(1024 * 1000), "1.02 MB");
  // 1024 * 1024 = 1048576
  assert.equal(getReadableFileSize(1024 * 1024), "1.05 MB");
  // 1024 * 1024 * 1024 = 1073741824
  assert.equal(getReadableFileSize(1024 * 1024 * 1024), "1.07 GB");
});
