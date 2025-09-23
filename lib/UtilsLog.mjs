import { inspect as nodeInspect } from "node:util";
import * as winston from "winston";
import "winston-daily-rotate-file";
import objectInspect from "object-inspect";

/**
 * Utility functions for logging.
 * @module Log
 */

/**
 * 记录信息性消息到控制台
 * @param {...*} args - 要记录的参数列表
 */
export function logInfo(...args) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

/**
 * 记录警告消息到控制台
 * @param {...*} args - 要记录的参数列表
 */
export function logWarn(...args) {
  // eslint-disable-next-line no-console
  console.warn(...args);
}

/**
 * 记录错误消息到控制台
 * @param {...*} args - 要记录的参数列表
 */
export function logError(...args) {
  // eslint-disable-next-line no-console
  console.error(...args);
}

/**
 * Converts symbol keys to string keys in an object.
 * @param {Record<string | symbol, unknown>} obj
 * @returns {Record<string, unknown>}
 * @ignore
 */
function convertSymbolKeys(obj) {
  const result = { ...obj };
  const symbols = Object.getOwnPropertySymbols(obj);

  symbols.forEach((sym) => {
    const keyDescription = sym.description;
    if (keyDescription) {
      result[keyDescription] = obj[sym];
      delete result[sym];
    }
  });

  return result;
}

/**
 *
 * @returns {string}
 */
function getCallSite() {
  const stack = new Error().stack; // 我们只要 stack，不要抛异常
  if (!stack) return "unknown";

  // 0: Error
  // 1: getCallSite 本身
  // 2: 真实调用者（我们要的）
  const lines = stack.split("\n");
  const callSiteLines = lines.slice(2);

  const matchs = callSiteLines.map((line) => {
    return line.replace(/^\s*at\s*/, "");
  });
  return matchs.join(" <= ");
}

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
 * @param {boolean} [options.includeCallSite=false] - Whether to include the call site in the log message.
 * @param {string} [options.inspector='nodeInspect'] - The inspector function to use for formatting log messages. Support 'nodeInspect' or 'objectInspect'
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
export function createLogger({
  level = "info",
  meta = {},
  filename = "./logs/application-%DATE%.log",
  maxLength = 1000,
  zippedArchive = false,
  enableConsole = false,
  includeCallSite = false,
  inspector = "nodeInspect",
}) {
  const transport = new winston.transports.DailyRotateFile({
    filename,
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive,
    maxSize: "20m",
    maxFiles: "14d",
  });

  transport.on("error", (error) => {
    // log or handle errors here
    logError("transport on error");
    logError(error);
  });

  transport.on("rotate", (oldFilename, newFilename) => {
    // do something fun
    logInfo(`log file rotated from ${oldFilename} to ${newFilename}`);
  });

  const inspect = inspector === "nodeInspect" ? nodeInspect : objectInspect;

  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message, ...args }) => {
        const argsObj = convertSymbolKeys(args);
        if (includeCallSite) {
          argsObj.callSite = getCallSite();
        }
        const msgArr = [`${timestamp} ${level}:`, inspect(argsObj)];
        if (typeof message === "object" && message !== null) {
          msgArr.splice(1, 0, inspect(message));
        } else {
          msgArr[0] += `: ${message}`;
        }
        const msg = msgArr.join("\n");
        if (msg.length <= maxLength) {
          return msg;
        }
        return `${msg.substring(0, maxLength)}...`;
      }),
      // 确保错误堆栈信息被捕获
      winston.format.errors({ stack: true }),
    ),
    defaultMeta: meta,
    transports: [transport],
  });

  if (enableConsole) {
    logger.add(
      new winston.transports.Console({
        // format: winston.format.simple(),
      }),
    );
  }

  return logger;
}
