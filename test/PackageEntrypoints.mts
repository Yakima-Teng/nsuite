import assert from "node:assert/strict";
import { createRequire } from "node:module";
import * as esmModule from "#lib/index";

const require = createRequire(import.meta.url);
const cjsModule = require("../dist/cjs/index.cjs") as typeof esmModule;

assert.equal(typeof esmModule.parseEnvFiles, "function");
assert.equal(typeof cjsModule.parseEnvFiles, "function");
assert.equal(esmModule.joinPath("a", "b"), cjsModule.joinPath("a", "b"));
