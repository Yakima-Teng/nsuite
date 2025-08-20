import assert from "node:assert/strict";
import test from "node:test";

import { getError } from "#lib/index";

test("Successful get Error instance", () => {
  const errMessage = "test";
  const errList = [
    getError(new Error(errMessage)),
    getError({ message: errMessage }),
    getError(errMessage),
  ];
  for (const err of errList) {
    assert.ok(err instanceof Error);
    assert.ok(err.message === errMessage);
  }
});
