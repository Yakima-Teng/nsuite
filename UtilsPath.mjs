import { fileURLToPath } from "url";
import { dirname } from "path";
import { join, resolve } from "node:path";

/**
 * Returns the directory name of the given file URL.
 *
 * @param {string} metaUrl - The file URL to extract the directory name from.
 * @returns {string} The directory name of the given file URL.
 */
export function getDirname(metaUrl) {
  return dirname(fileURLToPath(metaUrl));
}

/**
 * Joins multiple path segments into a single path and resolves it to an absolute path.
 *
 * @param {...string} args - The path segments to join.
 * @returns {string} The resolved absolute path.
 */
export const joinPath = (...args) => {
  return resolve(join(...args));
};
