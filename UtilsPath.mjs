import { fileURLToPath } from "url";
import { dirname } from "path";

export function getDirname(metaUrl) {
  return dirname(fileURLToPath(metaUrl));
}
