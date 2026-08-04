import assert from "node:assert/strict";
import test from "node:test";

import {
  getError,
  getObjectKeys,
  parseJsonString,
  stringifyToJsonString,
} from "#lib/index";

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

test("Serialize unknown values when getting Error instance", () => {
  const errValue = { code: "ERR_TEST", retryable: false };
  assert.equal(getError(errValue).message, JSON.stringify(errValue));
});

test("Fallback when Error value cannot be serialized", () => {
  const circularValue: { self?: unknown } = {};
  circularValue.self = circularValue;
  assert.equal(getError(circularValue).message, "Unknown error");
});

test("Get typed object keys", () => {
  const value = { foo: 1, bar: 2 };
  const keys = getObjectKeys(value);
  const firstKey: keyof typeof value = keys[0];
  assert.deepEqual(keys, ["foo", "bar"]);
  assert.equal(firstKey, "foo");
});

test("Stringify and parse typed JSON string", () => {
  const value = {
    name: "nsuite",
    enabled: true,
    nested: { count: 2 },
  };
  const jsonString = stringifyToJsonString(value);
  const parsedValue = parseJsonString(jsonString);
  assert.equal(typeof jsonString, "string");
  assert.equal(parsedValue.name, value.name);
  assert.deepEqual(parsedValue, value);
});
