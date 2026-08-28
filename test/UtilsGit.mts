import assert from "node:assert/strict";
import test from "node:test";

import { getDirname, joinPath, refreshGitIndex } from "#lib/index";

test("refreshGitIndex should report the repository status", () => {
  const result = refreshGitIndex();
  assert.equal(typeof result.hasRealChanges, "boolean");
  assert.equal(typeof result.status, "string");
  assert.equal(result.hasRealChanges, result.status.length > 0);
});

test("refreshGitIndex should accept a cwd option", () => {
  const dirRepo = joinPath(getDirname(import.meta.url), "..");
  const result = refreshGitIndex({ cwd: dirRepo });
  assert.equal(typeof result.hasRealChanges, "boolean");
  assert.equal(typeof result.status, "string");
  assert.equal(result.hasRealChanges, result.status.length > 0);
});
