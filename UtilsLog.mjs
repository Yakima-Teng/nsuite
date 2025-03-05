import * as winston from "winston";
import "winston-daily-rotate-file";

export const createLogger = ({
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
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint(),
      // 确保错误堆栈信息被捕获
      winston.format.errors({ stack: true }),
    ),
    defaultMeta: { service: "multi-image-viewer" },
    transports: [transport],
  });

  if (enableConsole) {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    );
  }
};
