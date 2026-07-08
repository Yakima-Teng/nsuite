import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import test from "node:test";

import { getDirname, joinPath, isMainModule } from "#lib/index";

const __dirname = getDirname(import.meta.url);

test("should return false when not called from the entry module", () => {
  // The entry point is test/index.mts, so isMainModule from this file should be false
  assert.strictEqual(isMainModule(import.meta.url), false);
});

test("should return true when called from the entry module", async () => {
  const fixturePath = joinPath(__dirname, "fixtures/module-entry-check.mts");
  const stdout = await new Promise<string>((resolve, reject) => {
    execFile(
      process.execPath,
      [fixturePath],
      { cwd: joinPath(__dirname, "..") },
      (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout);
      },
    );
  });
  assert.strictEqual(stdout.trim(), "true");
});

test("should return false for an invalid URL", () => {
  assert.strictEqual(isMainModule("not-a-url"), false);
});

test("should return false for an empty string", () => {
  assert.strictEqual(isMainModule(""), false);
});
