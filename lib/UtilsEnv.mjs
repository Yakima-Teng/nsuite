import dotenv from "dotenv";

/**
 * Utility functions for environment variables.
 * @module 01-Env
 */

/**
 * Parses environment files using dotenv.
 *
 * @param {string[]} pathArr - An array of paths to the environment files.
 * @returns {import('dotenv').DotenvConfigOutput} returns - The result of the dotenv configuration.
 *
 * @example
 * import { parseEnvFiles } from "nsuite";
 *
 * // Note: the first value set for a varialble will win
 * parseEnvFiles([
 *   path.resolve(process.cwd(), ".env.local"),
 *   path.resolve(process.cwd(), ".env"),
 * ]);
 */
export function parseEnvFiles(pathArr) {
  return dotenv.config({
    path: pathArr,
  });
}
