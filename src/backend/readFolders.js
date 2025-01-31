import fs from 'fs';
import path from "path";

export async function listFolders(directoryPath) {
    return fs.readdirSync(directoryPath).filter(file => 
      fs.statSync(path.join(directoryPath, file)).isDirectory()
    );
}

export function readFromFile (filePath) {
    return fs.readFileSync(filePath, 'utf8');
};