import { fileURLToPath } from "url";
import { dirname, join, resolve } from "node:path";
import { join as joinPosix, resolve as resolvePosix } from "node:path/posix";
import { access } from "fs/promises";
import { glob } from "glob";

/**
 * Converts a file URL to a file path.
 *
 * @param {string} metaUrl - The file URL to convert.
 * @returns {string} The file path corresponding to the given file URL.
 *
 * @example
 * import { getFilePath } from "nsuite";
 * const __filename = getFilePath(import.meta.url);
 */
export function getFilePath(metaUrl) {
  return fileURLToPath(metaUrl);
}

/**
 * Returns the directory name of the given file URL.
 *
 * @param {string} metaUrl - The file URL to extract the directory name from.
 * @returns {string} The directory name of the given file URL.
 *
 * @example
 * import { getDirname } from "nsuite";
 * const __dirname = getDirname(import.meta.url);
 */
export function getDirname(metaUrl) {
  return dirname(fileURLToPath(metaUrl));
}

/**
 * Joins multiple path segments into a single path.
 *
 * @param {...string} args - The path segments to join.
 * @returns {string} The joined path.
 *
 * @example
 * import { joinPath } from "nsuite";
 * const targetPath = joinPath("path", "to", "file.txt");
 */
export function joinPath(...args) {
  return join(...args);
}

/**
 * Joins multiple path segments into a single POSIX path.
 *
 * @param {...string} args - The path segments to join.
 * @returns {string} The joined POSIX path.
 *
 * @example
 * import { joinPosixPath } from "nsuite";
 * const targetPath = joinPosixPath("path", "to", "file.txt");
 */
export function joinPosixPath(...args) {
  return joinPosix(...args);
}

/**
 * Resolves multiple path segments to an absolute path.
 *
 * @param {...string} args - The path segments to resolve.
 * @returns {string} The resolved absolute path.
 *
 * @example
 * import { resolvePath } from "nsuite";
 * const targetPath = resolvePath("path", "to", "file.txt");
 */
export function resolvePath(...args) {
  return resolve(...args);
}

/**
 * Resolves multiple path segments to an absolute POSIX path.
 *
 * @param {...string} args - The path segments to resolve.
 * @returns {string} The resolved absolute POSIX path.
 *
 * @example
 * import { resolvePosixPath } from "nsuite";
 * const targetPath = resolvePosixPath("path", "to", "file.txt");
 */
export function resolvePosixPath(...args) {
  return resolvePosix(...args);
}

/**
 * Checks if a given path exists.
 *
 * @param {string} path - The path to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the path exists, otherwise `false`.
 *
 * @example
 * import { isPathExists } from "nsuite";
 * const isExists = isPathExists("path/to/file.txt")
 */
export async function isPathExists(path) {
  try {
    await access(path);
    return true;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return false;
  }
}

/**
 * Matches file paths using glob patterns.
 *
 * @param {...string} pathArr - The path segments to join and match using glob patterns.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of matched file paths.
 *
 * @example
 * import { globMatchPaths } from "nsuite";
 * const excelFileList = await globMatchPaths(
 *   joinPath(__dirname, "materials/*.xlsx"),
 * );
 */
export async function globMatchPaths(...pathArr) {
  const targetPath = joinPath(...pathArr).replace(/\\/g, "/");
  return await glob(targetPath, { nocase: true });
}
