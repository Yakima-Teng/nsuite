/**
 * Utility functions for working with file paths.
 * @module Path
 */
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
export function getFilePath(metaUrl: string): string;
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
export function getDirname(metaUrl: string): string;
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
export function joinPath(...args: string[]): string;
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
export function joinPosixPath(...args: string[]): string;
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
export function resolvePath(...args: string[]): string;
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
export function resolvePosixPath(...args: string[]): string;
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
export function isPathExists(path: string): Promise<boolean>;
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
export function globMatchPaths(...pathArr: string[]): Promise<Array<string>>;
//# sourceMappingURL=UtilsPath.d.mts.map