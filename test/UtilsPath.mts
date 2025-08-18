import assert from "node:assert/strict";
import test from "node:test";

import {
  getDirname,
  getFilePath,
  joinPath,
  isPathExists,
  globMatchPaths,
} from "#src/index";

test("Directory path should exists", async () => {
  assert.deepEqual(await isPathExists(getDirname(import.meta.url)), true);
});

test("File path should exists", async () => {
  assert.deepEqual(await isPathExists(getFilePath(import.meta.url)), true);
});

test("joinPath should work", () => {
  const filePath = getFilePath(import.meta.url);
  const dirPath = getDirname(import.meta.url);
  const targetFilePath = joinPath(dirPath, "UtilsPath.mts");
  assert.deepEqual(filePath, targetFilePath);
});

test("globMatchPaths should work", async () => {
  const match = await globMatchPaths(
    joinPath(getDirname(import.meta.url), "*.mts"),
  );
  const filePath = getFilePath(import.meta.url);
  assert.deepEqual(match.includes(filePath), true);
});
