/**
 * Utilities functions for type
 * @module Type
 */

/**
 * JSON string with its parsed value type
 * @template T
 * @typedef {string & { __brand: "JSONString", __type: T }} JSONString
 */

/**
 * Get Error instance
 * @param {unknown} err
 * @returns {Error}
 *
 * @example
 * import { getError } from 'nsuite
 * console.log(getError(err).message)
 */
export function getError(err) {
  if (err instanceof Error) {
    return err;
  }
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string" &&
    err.message
  ) {
    return new Error(err.message);
  }
  if (typeof err === "string") {
    return new Error(err);
  }
  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error("Unknown error");
  }
}

/**
 * Get typed enumerable property keys from an object
 * @template {object} T
 * @param {T} obj
 * @returns {Array<keyof T>}
 *
 * @example
 * import { getObjectKeys } from 'nsuite'
 * console.log(getObjectKeys({ foo: 1 }))
 */
export function getObjectKeys(obj) {
  return /** @type {Array<keyof T>} */ (Object.keys(obj));
}

/**
 * Parse a typed JSON string
 * @template T
 * @param {JSONString<T>} jsonString
 * @returns {T}
 *
 * @example
 * import { parseJsonString, stringifyToJsonString } from 'nsuite'
 * console.log(parseJsonString(stringifyToJsonString({ foo: 1 })))
 */
export function parseJsonString(jsonString) {
  return /** @type {T} */ (JSON.parse(jsonString));
}

/**
 * Stringify a value as a typed JSON string
 * @template T
 * @param {T} obj
 * @returns {JSONString<T>}
 *
 * @example
 * import { stringifyToJsonString } from 'nsuite'
 * console.log(stringifyToJsonString({ foo: 1 }))
 */
export function stringifyToJsonString(obj) {
  return /** @type {JSONString<T>} */ (JSON.stringify(obj));
}
