import { fileURLToPath } from "url";
import { dirname, join, resolve } from "node:path";
import { access } from "fs/promises";
import { glob } from "glob";

/**
 * Converts a file URL to a file path.
 *
 * @param {string} metaUrl - The file URL to convert.
 * @returns {string} The file path corresponding to the given file URL.
 */
export function getFilePath(metaUrl) {
  return fileURLToPath(metaUrl);
}

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

/**
 * Checks if a given path exists.
 *
 * @param {string} path - The path to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the path exists, otherwise `false`.
 */
export const isPathExists = async (path) => {
  try {
    await access(path);
    return true;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return false;
  }
};

/**
 * Matches file paths using glob patterns.
 *
 * @param {...string} pathArr - The path segments to join and match using glob patterns.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of matched file paths.
 */
export const globMatchPaths = async (...pathArr) => {
  const targetPath = joinPath(...pathArr).replace(/\\/g, "/");
  return await glob(targetPath, { nocase: true });
};
