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
export function joinPath(...args: string[]): string;
export function isPathExists(path: string): Promise<boolean>;
export function globMatchPaths(...pathArr: string[]): Promise<Array<string>>;
//# sourceMappingURL=UtilsPath.d.mts.map