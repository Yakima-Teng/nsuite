/**
 * Utility functions for working with files.
 * @module File
 */
/**
 * Generates a safe file name by replacing special characters with underscores.
 * Consecutive underscores are also reduced to a single underscore.
 *
 * @param {string} fileName - The original file name to be sanitized.
 * @returns {string} - The sanitized file name with special characters replaced by underscores and consecutive underscores reduced to a single underscore.
 *
 * @example
 * import { getSafeFileName } from "nsuite";
 * const safeFileName = getSafeFileName("测试有空格 和特殊符号 &.pdf");
 */
export function getSafeFileName(fileName: string): string;
/**
 * Zips a single file and returns a promise that resolves when the zip operation is complete.
 *
 * @param {Object} options - The options for the zip operation.
 * @param {string} options.pathInputFile - The path to the input file to be zipped.
 * @param {string} options.pathOutputFile - The path to the output zip file.
 * @returns {Promise<number>} - A promise that resolves with final zip file size in Bytes when the zip operation is complete.
 *
 * @example
 * import { zipFile } from "nsuite";
 * await zipFile({
 *   pathInputFile: "./package.json",
 *   pathOutputFile: "./package.json.zip",
 * });
 */
export function zipFile(options: {
    pathInputFile: string;
    pathOutputFile: string;
}): Promise<number>;
/**
 * Zips a folder and returns a promise that resolves when the zip operation is complete.
 *
 * @param {Object} options - The options for the zip operation.
 * @param {string} options.pathFolder - The path to the folder to be zipped.
 * @param {string} options.pathOutputFile - The path to the output zip file.
 * @returns {Promise<number>} - A promise that resolves with final zip file size in Bytes when the zip operation is complete.
 *
 * @example
 * import { zipFolder } from "nsuite";
 * await zipFolder({
 *   pathFolder: "./dist",
 *   pathOutputFile: "./dist.zip",
 * });
 */
export function zipFolder(options: {
    pathFolder: string;
    pathOutputFile: string;
}): Promise<number>;
/**
 * Unzips a file and returns a promise that resolves when the unzip operation is complete.
 *
 * @param {Object} options - The options for the unzip operation.
 * @param {string} options.pathFile - The path to the zip file to be unzipped.
 * @param {string} options.pathOutput - The path to the output directory.
 * @returns {Promise<void>} - A promise that resolves when the unzip operation is complete.
 *
 * @example
 * import { unzipFile } from "nsuite";
 *
 * await unzipFile({
 *   pathFile: pathDistZip,
 *   pathOutput: pathOutputDirectory,
 * });
 */
export function unzipFile({ pathFile, pathOutput }: {
    pathFile: string;
    pathOutput: string;
}): Promise<void>;
/**
 * @typedef {import('filesize').FilesizeOptions} CustomFilesizeOptions
 * @property {string} [output] - output format， only 'string' is supported
 */
/**
 * converts file size in bytes to human-readable string
 * @param {number | string} size
 * @param {CustomFilesizeOptions} [options]
 * @returns {string}
 *
 * @example
 * import { getReadableFileSize } from "nsuite";
 *
 * getReadableFileSize(0); // "0 B"
 *
 * // 1024-based, with { standard: "jedec" }
 * getReadableFileSize(1024, { standard: "jedec" }); // "1 KB"
 * getReadableFileSize(1024 * 1024, { standard: "jedec" }); // "1 MB"
 * getReadableFileSize(1024 * 1024 * 1024, { standard: "jedec" }); // "1 GB"
 *
 * // 1000-based, default
 * getReadableFileSize(1000); // "1 kB"
 * getReadableFileSize(1001); // "1 kB"
 * getReadableFileSize(1010); // "1.01 kB"
 * getReadableFileSize(1100); // 1.1 kB"
 * getReadableFileSize(1024); // "1.02 kB"
 * getReadableFileSize(1024 * 1000); // "1.02 MB"
 * // 1024 * 1024 = 1048576
 * getReadableFileSize(1024 * 1024); // "1.05 MB"
 * // 1024 * 1024 * 1024 = 1073741824
 * getReadableFileSize(1024 * 1024 * 1024); // "1.07 GB"
 */
export function getReadableFileSize(size: number | string, options?: CustomFilesizeOptions): string;
/**
 * Calculates the MD5 hash of a file and returns a promise that resolves with the hash.
 *
 * @param {Object} options - The options for the hash operation.
 * @param {string} options.pathFile - The path to the file for which the hash is to be calculated.
 * @returns {Promise<string>} - A promise that resolves with the MD5 hash of the file.
 *
 * @example
 * import { getFileMd5 } from "nsuite";
 * const md5 = await getFileMd5({ pathFile: "./package.json" });
 */
export function getFileMd5({ pathFile }: {
    pathFile: string;
}): Promise<string>;
export type CustomFilesizeOptions = import("filesize").FilesizeOptions;
//# sourceMappingURL=UtilsFile.d.mts.map