/**
 * Converts a file URL to a file path.
 *
 * @param {string} metaUrl - The file URL to convert.
 * @returns {string} The file path corresponding to the given file URL.
 */
export function getFilePath(metaUrl: string): string;
/**
 * Returns the directory name of the given file URL.
 *
 * @param {string} metaUrl - The file URL to extract the directory name from.
 * @returns {string} The directory name of the given file URL.
 */
export function getDirname(metaUrl: string): string;
/**
 * Joins multiple path segments into a single path.
 *
 * @param {...string} args - The path segments to join.
 * @returns {string} The joined path.
 */
export function joinPath(...args: string[]): string;
/**
 * Joins multiple path segments into a single POSIX path.
 *
 * @param {...string} args - The path segments to join.
 * @returns {string} The joined POSIX path.
 */
export function joinPosixPath(...args: string[]): string;
/**
 * Resolves multiple path segments to an absolute path.
 *
 * @param {...string} args - The path segments to resolve.
 * @returns {string} The resolved absolute path.
 */
export function resolvePath(...args: string[]): string;
/**
 * Resolves multiple path segments to an absolute POSIX path.
 *
 * @param {...string} args - The path segments to resolve.
 * @returns {string} The resolved absolute POSIX path.
 */
export function resolvePosixPath(...args: string[]): string;
/**
 * Checks if a given path exists.
 *
 * @param {string} path - The path to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the path exists, otherwise `false`.
 */
export function isPathExists(path: string): Promise<boolean>;
/**
 * Matches file paths using glob patterns.
 *
 * @param {...string} pathArr - The path segments to join and match using glob patterns.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of matched file paths.
 */
export function globMatchPaths(...pathArr: string[]): Promise<Array<string>>;
//# sourceMappingURL=UtilsPath.d.mts.map