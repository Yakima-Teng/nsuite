export function createLogger({ level, meta, filename, maxLength, zippedArchive, enableConsole, }: {
    level?: string;
    meta?: Record<string, string>;
    filename?: string;
    maxLength?: number;
    zippedArchive?: boolean;
    enableConsole?: boolean;
}): winston.Logger;
import * as winston from "winston";
//# sourceMappingURL=UtilsLog.d.mts.map