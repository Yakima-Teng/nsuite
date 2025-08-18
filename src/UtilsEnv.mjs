import dotenv from "dotenv";

/**
 * Parses environment files using dotenv.
 *
 * @param {string[]} pathArr - An array of paths to the environment files.
 * @returns {Object} returns - The result of the dotenv configuration.
 * @returns {import('dotenv').DotenvConfigOutput}
 */
export const parseEnvFiles = (pathArr) => {
  return dotenv.config({
    path: pathArr,
  });
};
