import assert from "node:assert/strict";
import test from "node:test";

import {
  withTimeout,
  TIMEOUT_ERROR_MESSAGE,
  DEFAULT_PROMISE_TIME_OUT,
} from "#lib/index";

test("withTimeout in case of timeout with specified timeout", async () => {
  const rawPromise = new Promise((resolve) => {
    setTimeout(() => resolve("resolved"), DEFAULT_PROMISE_TIME_OUT);
  });
  try {
    await withTimeout(rawPromise, Math.round(DEFAULT_PROMISE_TIME_OUT / 2));
  } catch (err) {
    assert.ok(err instanceof Error, "err should be an instance of Error");
    assert.strictEqual(err.message, TIMEOUT_ERROR_MESSAGE);
  }
});

test("withTimeout in case of timeout without specified timeout", async () => {
  const rawPromise = new Promise((resolve) => {
    setTimeout(
      () => resolve("resolved"),
      Math.round(DEFAULT_PROMISE_TIME_OUT * 1.1),
    );
  });
  try {
    await withTimeout(rawPromise);
  } catch (err) {
    assert.ok(err instanceof Error, "err should be an instance of Error");
    assert.strictEqual(err.message, TIMEOUT_ERROR_MESSAGE);
  }
});

test("withTimeout not in case of timeout", async () => {
  const rawPromise = new Promise((resolve) => {
    setTimeout(
      () => resolve("resolved"),
      Math.round(DEFAULT_PROMISE_TIME_OUT / 2),
    );
  });
  try {
    await withTimeout(rawPromise, DEFAULT_PROMISE_TIME_OUT);
  } catch (err) {
    assert.ok(err instanceof Error, "err should be an instance of Error");
    assert.strictEqual(err.message, TIMEOUT_ERROR_MESSAGE);
  }
});
