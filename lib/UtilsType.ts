/**
 * Utilities functions for type
 * @module Type
 */

export type JSONString<T> = string & { __brand: "JSONString"; __type: T };

/**
 * Get Error instance
 *
 * @example
 * import { getError } from 'nsuite
 * console.log(getError(err).message)
 */
export function getError(err: unknown): Error {
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
 *
 * @example
 * import { getObjectKeys } from 'nsuite'
 * console.log(getObjectKeys({ foo: 1 }))
 */
export function getObjectKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Parse a typed JSON string
 *
 * @example
 * import { parseJsonString, stringifyToJsonString } from 'nsuite'
 * console.log(parseJsonString(stringifyToJsonString({ foo: 1 })))
 */
export function parseJsonString<T>(jsonString: JSONString<T>): T {
  return JSON.parse(jsonString) as T;
}

/**
 * Stringify a value as a typed JSON string
 *
 * @example
 * import { stringifyToJsonString } from 'nsuite'
 * console.log(stringifyToJsonString({ foo: 1 }))
 */
export function stringifyToJsonString<T>(obj: T): JSONString<T> {
  return JSON.stringify(obj) as JSONString<T>;
}
