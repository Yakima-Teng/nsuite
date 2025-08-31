import dotenv from "dotenv";

/**
 * Parses environment files using dotenv.
 *
 * @param {string[]} pathArr - An array of paths to the environment files.
 * @returns {import('dotenv').DotenvConfigOutput} returns - The result of the dotenv configuration.
 */
export function parseEnvFiles(pathArr) {
  return dotenv.config({
    path: pathArr,
  });
}
