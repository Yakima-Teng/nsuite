/**
 * Get Error instance
 * @param {unknown} err
 * @returns {Error}
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
