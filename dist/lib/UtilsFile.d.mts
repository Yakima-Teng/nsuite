export function getSafeFileName(fileName: string): string;
export function zipFile({ pathInputFile, pathOutputFile }: {
    pathInputFile: string;
    pathOutputFile: string;
}): Promise<number>;
export function zipFolder({ pathFolder, pathOutputFile }: {
    pathFolder: string;
    pathOutputFile: string;
}): Promise<number>;
export function getFileMd5({ pathFile }: {
    pathFile: string;
}): Promise<string>;
export function unzipFile({ pathFile, pathOutput }: {
    pathFile: string;
    pathOutput: string;
}): Promise<void>;
//# sourceMappingURL=UtilsFile.d.mts.map