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
} from "#lib/index";
import { joinPath } from "#lib/UtilsPath";

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
