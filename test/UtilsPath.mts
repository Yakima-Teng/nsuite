import os from "node:os";
import assert from "node:assert/strict";
import test from "node:test";

import {
  getDirname,
  getFilePath,
  joinPath,
  isPathExists,
  globMatchPaths,
} from "#lib/index";

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

  // Microsoft Windows Operating System
  if (os.platform() === "win32") {
    // filePath, e.g.: C:\workspace\develop\nsuite\test\UtilsPath.mts
    assert.match(filePath, /.+\\nsuite\\test\\UtilsPath\.mts$/);

    // import.meta.url, e.g.: file:///C:/workspace/develop/nsuite/test/UtilsPath.mts
    assert.match(
      import.meta.url,
      /^file:\/\/\/[A-Z]:\/.+\/nsuite\/test\/UtilsPath\.mts$/,
    );

    // dirPath, e.g.: C:\workspace\develop\nsuite\test
    assert.match(dirPath, /.+\\nsuite\\test$/);

    // targetFilePath, e.g.: C:\workspace\develop\nsuite\test\UtilsPath.mts
    assert.match(targetFilePath, /.+\\nsuite\\test\\UtilsPath\.mts$/);
  }

  // Unix-like Operating System
  else {
    // filePath, e.g.: /workspace/develop/nsuite/test/UtilsPath.mts
    assert.match(filePath, /.+\/nsuite\/test\/UtilsPath\.mts$/);

    // import.meta.url, e.g.: file:///workspace/develop/nsuite/test/UtilsPath.mts
    assert.match(
      import.meta.url,
      /^file:\/\/.+\/nsuite\/test\/UtilsPath\.mts$/,
    );

    // dirPath, e.g.: /workspace/develop/nsuite/test
    assert.match(dirPath, /.+\/nsuite\/test$/);
  }

  assert.deepEqual(filePath, targetFilePath);
});

test("globMatchPaths should work", async () => {
  const match = await globMatchPaths(
    joinPath(getDirname(import.meta.url), "*.mts"),
  );
  const filePath = getFilePath(import.meta.url);
  assert.deepEqual(match.includes(filePath), true);
});
