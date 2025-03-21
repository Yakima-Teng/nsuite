import { fileURLToPath } from "url";
import { dirname } from "path";
import { join, resolve } from "node:path";

export function getDirname(metaUrl) {
  return dirname(fileURLToPath(metaUrl));
}

export const joinPath = (...args) => {
  return resolve(join(...args));
};
