import inspect from "object-inspect";
import { logInfo, logError } from "#lib/UtilsLog";

/**
 * 为函数添加调试日志包装，自动记录函数调用前后的参数和返回值
 * @template {Function} T - 需要被包装的目标函数类型
 * @param {T} func - 需要被包装的目标函数
 * @returns {T} 包装后的函数，调用时会先打印入参日志，执行后打印返回值日志
 * @example
 * ```typescript
 * attachLogToFunc(console.log)("hello world")
 * ```
 */
export function attachLogToFunc(func) {
  /**
   * 包装后的函数，调用时会先打印入参日志，执行后打印返回值日志
   * @param {...*} args - 调用目标函数的参数
   * @returns {*} 目标函数的返回值
   */
  const wrapperFunc = (...args) => {
    logInfo();
    logInfo(`[DEBUG BEFORE] calling ${func.name} with args: ${inspect(args)}`);
    const result = func(...args);

    // 检查返回值是否为 Promise/thenable，若是则等待解析后再打印日志
    if (typeof result?.then === "function") {
      // 若返回值为 Promise，则等待解析后再打印日志
      return result
        .then(
          /**
           * 处理 Promise 解析后的结果，打印日志并透传结果
           * @param {*} resolvedResult - Promise 成功解析后的返回值
           * @returns {*} 透传解析结果以维持 Promise 链式调用
           */
          (resolvedResult) => {
            logInfo();
            logInfo(
              `[DEBUG AFTER] called ${func.name} with args: ${inspect(args)} return: ${inspect(resolvedResult)}`,
            );
            logInfo();
            return resolvedResult; // 保持原 Promise 链式调用能力
          },
        )
        .catch(
          /**
           * 处理 Promise 拒绝错误，打印错误日志并透传错误
           * @param {Error} error - Promise 被拒绝时的错误对象
           * @throws {Error} 透传原始错误以维持 Promise 错误处理链
           */
          (error) => {
            logInfo();
            logError(
              `[DEBUG ERROR] called ${func.name} with args: ${inspect(args)} error: ${inspect(error)}`,
            );
            logInfo();
            throw error; // 保持原 Promise 错误处理能力
          },
        );
    }

    // 非 Promise 结果直接打印日志
    logInfo();
    logInfo(
      `[DEBUG AFTER] called ${func.name} with args: ${inspect(args)} return: ${inspect(result)}`,
    );
    logInfo();
    return result;
  };

  // @ts-ignore
  return /** @type {T} */ (/** @type {unknown} */ wrapperFunc);
}
