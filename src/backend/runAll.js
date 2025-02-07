import { flatten } from "./flattener.js";
import { replaceId } from "./replacer.js";
import { updateHtmlContent } from "./templateChange.js";
import { cleanHtml } from "./cleanup.js";
import fs from "fs";
import path from "path";

export function runAll(html, selections, type) {
  if (selections.flatten) html = flatten(html);

  if (selections.replaceId) html = replaceId(html);

  if (selections.update)
    html = cleanHtml(updateHtmlContent(html, selections.update, type), type);

  return html;
}

export async function readAndRun(inputPath, outputPath, selections, type) {
  const html = await readFile(inputPath);

  const newHtml = runAll(html, selections, type);

  writeFile(outputPath, newHtml);
}

export async function readFile(filePath) {
  return new Promise((resolve, reject) => {
    let data = "";

    const stream = fs.createReadStream(filePath, {
      highWaterMark: 1 * 1024,
    });
    stream.on("data", (chunk) => {
      data += chunk;
    });

    stream.on("end", () => {
      resolve(data);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}

export function writeFile(filePath, data) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const writeStream = fs.createWriteStream(filePath, { encoding: "utf8" });
  writeStream.end(data);
}
