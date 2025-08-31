import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import fsPromise from "node:fs/promises";
import crypto from "node:crypto";
import archiver from "archiver";
import unzipper from "unzipper";
import { filesize } from "filesize";
import { ensureDir } from "fs-extra/esm";

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
export function getSafeFileName(fileName) {
  return fileName
    .replace(/[+\s?？！@#￥%…&*（）=·~!$^()/<>,;':"[\]{}]/g, "_")
    .replace(/__/g, "_");
}

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
export async function zipFile(options) {
  const { pathInputFile, pathOutputFile } = options;
  const outputDir = path.dirname(pathOutputFile);
  await ensureDir(outputDir);
  const outputStream = createWriteStream(pathOutputFile);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });
  archive.pipe(outputStream);
  archive.append(createReadStream(pathInputFile), {
    name: path.basename(pathInputFile),
  });
  return new Promise((resolve, reject) => {
    outputStream.on("close", () => {
      resolve(archive.pointer());
    });
    outputStream.on("error", (err) => {
      reject(err);
    });
    archive.on("error", (err) => {
      reject(err);
    });
    archive.finalize();
  });
}

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
export async function zipFolder(options) {
  const { pathFolder, pathOutputFile } = options;
  const outputDir = path.dirname(pathOutputFile);
  await ensureDir(outputDir);
  const outputStream = createWriteStream(pathOutputFile);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });
  archive.pipe(outputStream);
  archive.directory(pathFolder, false);
  return await new Promise((resolve, reject) => {
    outputStream.on("close", () => {
      resolve(archive.pointer());
    });
    outputStream.on("error", (err) => {
      reject(err);
    });
    archive.on("error", (/** @type {any} */ err) => {
      reject(err);
    });
    archive.finalize();
  });
}

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
export async function unzipFile({ pathFile, pathOutput }) {
  const directory = await unzipper.Open.file(pathFile);
  await directory.extract({ path: pathOutput });
}

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
export function getReadableFileSize(size, options) {
  return filesize(size, options);
}

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
export async function getFileMd5({ pathFile }) {
  const zipBuffer = await fsPromise.readFile(pathFile);
  const hash = crypto.createHash("md5");
  hash.update(zipBuffer);
  return hash.digest("hex");
}
