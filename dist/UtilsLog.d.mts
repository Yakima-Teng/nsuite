export function createLogger({ level, meta, filename, zippedArchive, enableConsole, }: {
    level?: string;
    meta?: Record<string, string>;
    filename?: string;
    zippedArchive?: boolean;
    enableConsole?: boolean;
}): winston.Logger;
import * as winston from "winston";
//# sourceMappingURL=UtilsLog.d.mts.map