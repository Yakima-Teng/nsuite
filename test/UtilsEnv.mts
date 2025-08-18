import assert from "node:assert/strict";
import test from "node:test";

import { parseEnvFiles, getDirname, joinPath } from "#src/index";

const __dirname = getDirname(import.meta.url);

test("The first definition win in case of duplicate definitions across multiple files", () => {
  parseEnvFiles([
    joinPath(__dirname, "../.env.production"),
    joinPath(__dirname, "../.env"),
  ]);
  const { TEST } = process.env;
  assert.strictEqual(TEST, "2");
});
