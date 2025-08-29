import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import fsPromise from "node:fs/promises";
import crypto from "node:crypto";
import archiver from "archiver";
import unzipper from "unzipper";

/**
 * Generates a safe file name by replacing special characters with underscores.
 * Consecutive underscores are also reduced to a single underscore.
 *
 * @param {string} fileName - The original file name to be sanitized.
 * @returns {string} - The sanitized file name with special characters replaced by underscores and consecutive underscores reduced to a single underscore.
 */
export const getSafeFileName = (fileName) => {
  return fileName
    .replace(/[+\s?？！@#￥%…&*（）=·~!$^()/<>,;':"[\]{}]/g, "_")
    .replace(/__/g, "_");
};

/**
 * Zips a single file and returns a promise that resolves when the zip operation is complete.
 *
 * @param {Object} options - The options for the zip operation.
 * @param {string} options.pathInputFile - The path to the input file to be zipped.
 * @param {string} options.pathOutputFile - The path to the output zip file.
 * @returns {Promise<number>} - A promise that resolves with final zip file size in Bytes when the zip operation is complete.
 */
export const zipFile = async ({ pathInputFile, pathOutputFile }) => {
  const outputStream = createWriteStream(pathOutputFile);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });
  archive.pipe(outputStream);
  archive.append(createReadStream(pathInputFile), {
    name: path.basename(pathInputFile),
  });
  await archive.finalize();
  return await new Promise((resolve, reject) => {
    archive.on("close", () => {
      resolve(archive.pointer());
    });
    archive.on("error", (/** @type {any} */ err) => {
      reject(err);
    });
  });
};

/**
 * Zips a folder and returns a promise that resolves when the zip operation is complete.
 *
 * @param {Object} options - The options for the zip operation.
 * @param {string} options.pathFolder - The path to the folder to be zipped.
 * @param {string} options.pathOutputFile - The path to the output zip file.
 * @returns {Promise<number>} - A promise that resolves with final zip file size in Bytes when the zip operation is complete.
 */
export const zipFolder = async ({ pathFolder, pathOutputFile }) => {
  const outputStream = createWriteStream(pathOutputFile);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });
  archive.pipe(outputStream);
  archive.directory(pathFolder, false);
  await archive.finalize();
  return await new Promise((resolve, reject) => {
    archive.on("close", () => {
      resolve(archive.pointer());
    });
    archive.on("error", (/** @type {any} */ err) => {
      reject(err);
    });
  });
};

/**
 * Calculates the MD5 hash of a file and returns a promise that resolves with the hash.
 *
 * @param {Object} options - The options for the hash operation.
 * @param {string} options.pathFile - The path to the file for which the hash is to be calculated.
 * @returns {Promise<string>} - A promise that resolves with the MD5 hash of the file.
 */
export const getFileMd5 = async ({ pathFile }) => {
  const zipBuffer = await fsPromise.readFile(pathFile);
  const hash = crypto.createHash("md5");
  hash.update(zipBuffer);
  return hash.digest("hex");
};

/**
 * Unzips a file and returns a promise that resolves when the unzip operation is complete.
 *
 * @param {Object} options - The options for the unzip operation.
 * @param {string} options.pathFile - The path to the zip file to be unzipped.
 * @param {string} options.pathOutput - The path to the output directory.
 * @returns {Promise<void>} - A promise that resolves when the unzip operation is complete.
 */
export const unzipFile = async ({ pathFile, pathOutput }) => {
  const directory = await unzipper.Open.file(pathFile);
  await directory.extract({ path: pathOutput });
};
