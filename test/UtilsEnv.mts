import assert from "node:assert/strict";
import test from "node:test";

import { parseEnvFiles, getDirname, joinPath } from "#lib/index";

const __dirname = getDirname(import.meta.url);

test("The first definition win in case of duplicate definitions across multiple files", () => {
  parseEnvFiles([
    joinPath(__dirname, "../../aimian/.env.pre"),
    joinPath(__dirname, "../../aimian/.env"),
  ]);
  const { HOME_URL = "" } = process.env;
  assert.ok(HOME_URL.startsWith("https://"));
});
