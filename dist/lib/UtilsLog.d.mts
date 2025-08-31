/**
 * Utility functions for logging.
 * @module 05-Log
 */
/**
 * 记录信息性消息到控制台
 * @param {...*} args - 要记录的参数列表
 */
export function logInfo(...args: any[]): void;
/**
 * 记录警告消息到控制台
 * @param {...*} args - 要记录的参数列表
 */
export function logWarn(...args: any[]): void;
/**
 * 记录错误消息到控制台
 * @param {...*} args - 要记录的参数列表
 */
export function logError(...args: any[]): void;
/**
 * Creates a Winston logger with a daily rotating file transport and optional console transport.
 *
 * @param {Object} options - Configuration options for the logger.
 * @param {string} [options.level="info"] - The log level.
 * @param {Record<string, string>} [options.meta={}] - The name of the server.
 * @param {string} [options.filename="./logs/application-%DATE%.log"] - The filename pattern for the log files.
 * @param {number} [options.maxLength=1000] - The maximum length of the log message.
 * @param {boolean} [options.zippedArchive=false] - Whether to zip old log files.
 * @param {boolean} [options.enableConsole=false] - Whether to enable console logging.
 * @returns {winston.Logger} - The configured Winston logger instance.
 *
 * @example
 * import { createLogger } from "nsuite";
 * export const logger = createLogger({
 *   level: "info",
 *   meta: {
 *     serverName: "your-server-name",
 *     NODE_ENV: process.env.NODE_ENV,
 *     MODE: process.env.MODE,
 *   },
 *   maxLength: 1000,
 *   filename: "./logs/application-%DATE%.log",
 *   zippedArchive: false,
 *   enableConsole: process.env.NODE_ENV !== "production",
 * });
 */
export function createLogger({ level, meta, filename, maxLength, zippedArchive, enableConsole, }: {
    level?: string | undefined;
    meta?: Record<string, string> | undefined;
    filename?: string | undefined;
    maxLength?: number | undefined;
    zippedArchive?: boolean | undefined;
    enableConsole?: boolean | undefined;
}): winston.Logger;
import * as winston from "winston";
//# sourceMappingURL=UtilsLog.d.mts.map