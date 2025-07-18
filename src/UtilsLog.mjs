import * as winston from "winston";
import "winston-daily-rotate-file";
import inspect from "object-inspect";

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
 * @param {boolean} [options.zippedArchive=false] - Whether to zip old log files.
 * @param {boolean} [options.enableConsole=false] - Whether to enable console logging.
 * @returns {winston.Logger} - The configured Winston logger instance.
 */
export const createLogger = ({
  level = "info",
  meta = {},
  filename = "./logs/application-%DATE%.log",
  zippedArchive = false,
  enableConsole = false,
}) => {
  const transport = new winston.transports.DailyRotateFile({
    filename,
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive,
    maxSize: "20m",
    maxFiles: "14d",
  });

  transport.on("error", (error) => {
    // log or handle errors here
    console.error("transport on error");
    console.error(error);
  });

  transport.on("rotate", (oldFilename, newFilename) => {
    // do something fun
    console.info(`log file rotated from ${oldFilename} to ${newFilename}`);
  });

  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message, ...args }) => {
        return `${timestamp} ${level}: ${message}, ${inspect(convertSymbolKeys(args))}`;
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
};
