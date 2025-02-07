import fs from "fs";
import path from "path";
import { readFile } from "./runAll.js";

export async function listFolders(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return;
  }
  return fs
    .readdirSync(directoryPath)
    .filter((file) =>
      fs.statSync(path.join(directoryPath, file)).isDirectory()
    );
}

export async function readFromFile(filePath) {
   if (!fs.existsSync(filePath)) {
      return;
    }
  return await readFile(filePath);
}


