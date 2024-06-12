import { flatten } from "./flattener.js";
import { replaceId } from "./replacer.js";
import { updateHtmlContent } from "./templateChange.js";
import { cleanHtml } from "./cleanup.js";
import fs from 'fs';
import path from "path";

export function runAll (html, selections, type) {
    if (selections.flatten)
        html = flatten(html);

    if (selections.replaceId)
        html = replaceId(html);

    if (selections.update)
        html = cleanHtml(updateHtmlContent(html, selections.update, type), type);
    
    return html;
}

export function readAndRun(inputPath, outputPath, selections, type) {
    const html = readFile(inputPath);

    const newHtml = runAll(html, selections, type);

    writeFile(outputPath, newHtml);
}

export function readFile (filePath) {
    return fs.readFileSync(filePath, 'utf8');
};
  
export function writeFile (filePath, data) {
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(filePath, data, 'utf8');
};

export function copyFolder (src, dest) {
    fs.cpSync(src, dest, {recursive: true});
}
