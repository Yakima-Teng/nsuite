/**
 * Utility functions for debugging
 * @module Debug
 */
/**
 * 为函数添加调试日志包装，自动记录函数调用前后的参数和返回值
 * @template {Function} T - 需要被包装的目标函数类型
 * @param {T} func - 需要被包装的目标函数
 * @returns {T} 包装后的函数，调用时会先打印入参日志，执行后打印返回值日志
 *
 * @example
 * import { attachLogToFunc } from 'nsuite
 * attachLogToFunc(console.log)("hello world")
 */
export function attachLogToFunc<T extends Function>(func: T): T;
//# sourceMappingURL=UtilsDebug.d.mts.map