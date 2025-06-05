import dotenv from "dotenv";

/**
 * Parses environment files using dotenv.
 *
 * @param {string[]} pathArr - An array of paths to the environment files.
 * @returns {Object} returns - The result of the dotenv configuration.
 * @returns {Object.<string, string> | undefined} returns.parsed - An object containing the parsed environment variables with keys and values of type string, or undefined if no environment variables are parsed.
 * @returns {Error | undefined} returns.error - An error object if an error occurred, null if no error occurred, or undefined if the error information is not available.
 */
export const parseEnvFiles = (pathArr) => {
  return dotenv.config({
    path: pathArr,
  });
};
