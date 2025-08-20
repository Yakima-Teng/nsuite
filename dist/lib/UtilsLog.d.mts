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