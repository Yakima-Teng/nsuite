import { fileURLToPath } from "url";
import { resolve } from "node:path";
import { logError } from "#lib/UtilsLog";

/**
 * Utility functions for determining module execution context.
 * @module Module
 */

/**
 * Determines whether the calling module is the entry point (directly executed by Node.js).
 *
 * This is useful for scripts that can either be run directly via `node` or imported by
 * other modules. By checking `isMainModule(import.meta.url)`, you can conditionally
 * execute code only when the file is the entry point.
 *
 * @param {string} callerModuleUrl - The `import.meta.url` of the calling module.
 * @returns {boolean} `true` if the calling module is the Node.js entry point, `false` otherwise.
 *
 * @example
 * import { isMainModule } from "nsuite";
 *
 * if (isMainModule(import.meta.url)) {
 *   // This block runs only when this file is executed directly
 *   myFunction();
 * }
 */
export function isMainModule(callerModuleUrl) {
  try {
    const callerFilePath = fileURLToPath(callerModuleUrl);
    const resolvedCallerFile = resolve(callerFilePath);
    const entryFilePath = resolve(process.argv[1]);
    return resolvedCallerFile === entryFilePath;
  } catch (error) {
    logError(
      `Failed to determine entry module: callerModuleUrl=${callerModuleUrl}`,
      error,
    );
    return false;
  }
}
