import inspect from "object-inspect";
import {
  getObjectKeys,
  parseJsonString,
  stringifyToJsonString,
  type JSONString,
} from "./UtilsType.js";

/**
 * Utilities functions for string
 * @module String
 */

const lowercaseArr = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];
const uppercaseArr = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const numberArr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Generate a random alphanumeric string with the specified length
 * @param {number} len
 * @returns {string}
 *
 * @example
 * import { generateRandomString } from 'nsuite'
 * console.log(generateRandomString(16))
 */
export function generateRandomString(len: number): string {
  const listArr = [lowercaseArr, uppercaseArr, numberArr];
  const getRandomStr = () => {
    const idx = Math.floor(Math.random() * listArr.length);
    const arr = listArr[idx];
    return arr[Math.floor(Math.random() * arr.length)];
  };
  const returnArr = Array.from({ length: len }, () => {
    return getRandomStr();
  });
  returnArr.sort(() => (Math.random() > 0.5 ? 1 : -1));
  return returnArr.join("");
}

/**
 * Limit a string to the specified maximum length
 * @template {string} T
 * @param {T} str
 * @param {number} len
 * @returns {T}
 *
 * @example
 * import { limitStringLength } from 'nsuite'
 * console.log(limitStringLength('nsuite', 3))
 */
export function limitStringLength<T extends string>(str: T, len: number): T {
  return str.substring(0, len) as T;
}

/**
 * Proportionally limit string values in a typed JSON string
 * @template {Record<string, string>} T
 * @param {import("./UtilsType.js").JSONString<T>} str
 * @param {number} len
 * @returns {import("./UtilsType.js").JSONString<T>}
 *
 * @example
 * import { limitJsonStringLength, stringifyToJsonString } from 'nsuite'
 * console.log(limitJsonStringLength(stringifyToJsonString({ text: 'nsuite' }), 20))
 */
export function limitJsonStringLength<T extends Record<string, string>>(
  str: JSONString<T>,
  len: number,
): JSONString<T> {
  if (str.length <= len) {
    return str;
  }
  const json = parseJsonString(str);
  const keys = getObjectKeys(json);
  const ratio = len / str.length;
  for (const key of keys) {
    const value = json[key];
    if (typeof value === "string") {
      json[key] = limitStringLength(
        value,
        Math.floor(value.length * ratio) - 10,
      );
    }
  }
  return stringifyToJsonString(json);
}

/**
 * Safely convert an unknown value to a readable string
 * @param {unknown} value
 * @returns {string}
 *
 * @example
 * import { safeStringify } from 'nsuite'
 * console.log(safeStringify({ name: 'nsuite' }))
 */
export function safeStringify(value: unknown): string {
  try {
    if (typeof value === "string") {
      return value;
    }
    return stringifyToJsonString(value);
  } catch {
    return inspect(value);
  }
}
