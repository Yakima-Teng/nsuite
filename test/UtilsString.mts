import assert from "node:assert/strict";
import test from "node:test";

import {
  generateRandomString,
  limitJsonStringLength,
  limitStringLength,
  parseJsonString,
  safeStringify,
  stringifyToJsonString,
} from "#lib/index";

test("Generate random alphanumeric string", () => {
  const value = generateRandomString(64);
  assert.equal(value.length, 64);
  assert.match(value, /^[A-Za-z0-9]+$/);
  assert.equal(generateRandomString(0), "");
});

test("Limit string length while retaining its literal type", () => {
  const value = limitStringLength("nsuite", 3);
  const typedValue: "nsuite" = value;
  assert.equal(typedValue, "nsu");
});

test("Return JSON string unchanged when within the length limit", () => {
  const jsonString = stringifyToJsonString({ name: "nsuite" });
  assert.equal(
    limitJsonStringLength(jsonString, jsonString.length),
    jsonString,
  );
});

test("Proportionally limit values in a typed JSON string", () => {
  const jsonString = stringifyToJsonString({
    name: "nsuite utility package",
    description: "Node.js development utilities",
  });
  const limitedJsonString = limitJsonStringLength(jsonString, 50);
  const limitedValue = parseJsonString(limitedJsonString);
  const typedName: string = limitedValue.name;
  assert.equal(typedName, "nsu");
  assert.equal(limitedValue.description, "Node.js ");
});

test("Safely stringify values and inspect circular structures", () => {
  assert.equal(safeStringify("nsuite"), "nsuite");
  assert.equal(safeStringify({ name: "nsuite" }), '{"name":"nsuite"}');

  const circularValue: { self?: unknown } = {};
  circularValue.self = circularValue;
  assert.equal(safeStringify(circularValue), "{ self: [Circular] }");
});
