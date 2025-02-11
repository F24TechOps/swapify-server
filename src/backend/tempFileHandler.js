import os from "os";

const tempDir = os.tmpdir();
const tempFiles = [];

export function createTmpFile (fileName) {
    tempFiles.push(fileName);
    //console.log(tempFiles);
}

export function getTmpDir () {
    return tempDir;
}

export function getTmpFiles () {
    return tempFiles;
}