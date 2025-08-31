import * as winston from "winston";
import "winston-daily-rotate-file";
import inspect from "object-inspect";

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
 */
export function createLogger({
  level = "info",
  meta = {},
  filename = "./logs/application-%DATE%.log",
  maxLength = 1000,
  zippedArchive = false,
  enableConsole = false,
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

  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message, ...args }) => {
        const msg = `${timestamp} ${level}: ${message}, ${inspect(convertSymbolKeys(args))}`;
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
