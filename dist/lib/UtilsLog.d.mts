export function createLogger({ level, meta, filename, maxLength, zippedArchive, enableConsole, }: {
    level?: string | undefined;
    meta?: Record<string, string> | undefined;
    filename?: string | undefined;
    maxLength?: number | undefined;
    zippedArchive?: boolean | undefined;
    enableConsole?: boolean | undefined;
}): winston.Logger;
export function logInfo(...args: any[]): void;
export function logWarn(...args: any[]): void;
export function logError(...args: any[]): void;
import * as winston from "winston";
//# sourceMappingURL=UtilsLog.d.mts.map