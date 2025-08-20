/**
 * Wraps a promise with a timeout. If the promise does not resolve or reject within the specified time,
 * it will be rejected with a ${TIMEOUT_ERROR_MESSAGE} error.
 *
 * @template T
 * @param {Promise<T>} promise - The promise to wrap with a timeout.
 * @param {number} [timeoutMs=3000] - The timeout duration in milliseconds.
 * @returns {Promise<T>} - A new promise that either resolves with the original promise's value or rejects with a timeout error if the timeout duration is exceeded.
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs?: number): Promise<T>;
export const TIMEOUT_ERROR_MESSAGE: "TimeoutError";
export const DEFAULT_PROMISE_TIME_OUT: 3000;
//# sourceMappingURL=UtilsPromise.d.mts.map