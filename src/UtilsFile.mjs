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
