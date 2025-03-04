export function withTimeout(promise, timeoutMs) {
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
