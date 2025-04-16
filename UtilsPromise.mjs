/**
 * Wraps a promise with a timeout. If the promise does not resolve or reject within the specified time,
 * it will be rejected with a "Promise timed out" error.
 *
 * @param {Promise} promise - The promise to wrap with a timeout.
 * @param {number} [timeoutMs=3000] - The timeout duration in milliseconds.
 * @returns {Promise} - A new promise that either resolves with the original promise's value or rejects with a timeout error if the timeout duration is exceeded.
 */
export function withTimeout(promise, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    // 创建一个超时的 Promise
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Promise timed out"));
      }, timeoutMs);
    });

    // 使用 Promise.race 比较原 Promise 和超时 Promise
    Promise.race([promise, timeout]).then(resolve, reject);
  });
}
