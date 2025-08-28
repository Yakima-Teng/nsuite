export function getSafeFileName(fileName: string): string;
export function zipFile({ pathInputFile, pathOutputFile }: {
    pathInputFile: string;
    pathOutputFile: string;
}): Promise<void>;
export function zipFolder({ pathFolder, pathOutputFile }: {
    pathFolder: string;
    pathOutputFile: string;
}): Promise<void>;
export function getFileMd5({ pathFile }: {
    pathFile: string;
}): Promise<string>;
//# sourceMappingURL=UtilsFile.d.mts.map