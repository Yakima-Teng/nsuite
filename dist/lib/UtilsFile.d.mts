export function getSafeFileName(fileName: string): string;
export function zipFile(options: {
    pathInputFile: string;
    pathOutputFile: string;
}): Promise<number>;
export function zipFolder(options: {
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
export function getReadableFileSize(size: number | string, options?: import("filesize").FilesizeOptions & {
    output?: "string";
}): string;
//# sourceMappingURL=UtilsFile.d.mts.map