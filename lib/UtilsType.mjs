/**
 * Get Error instance
 * @param {unknown} err
 * @returns {Error}
 *
 * @example
 * import { getError } from 'nsuite
 * try {
 *   // ...
 * } catch (err) {
 *   return [getError(err), undefined]
 * }
 */
export function getError(err) {
  if (err instanceof Error) {
    return err;
  }
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string" &&
    err.message
  ) {
    return new Error(err.message);
  }
  if (typeof err === "string") {
    return new Error(err);
  }
  return new Error("Unknown error");
}
