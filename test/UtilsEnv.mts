import assert from "node:assert/strict";
import test from "node:test";

import { parseEnvFiles, getDirname, joinPath } from "#src/index";

const __dirname = getDirname(import.meta.url);

test("The first win in case of duplicate definition", () => {
  parseEnvFiles([
    joinPath(__dirname, "../.env.production"),
    joinPath(__dirname, "../.env"),
  ]);
  const { TEST } = process.env;
  assert.strictEqual(TEST, "2");
});
