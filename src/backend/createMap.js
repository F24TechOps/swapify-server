import { createMapping } from "./mapping.js";
import { readFile, writeFile } from "./runAll.js";
import { listFolders, readFromFile } from "./readFolders.js";
import * as cheerio from "cheerio";

const newHtml = async () => {
  const allFolders = await listFolders("./src/html/templates");
  return allFolders.reduce(async (modifier, folderName) => {
    if (folderName === "json") {
      return modifier;
    }
    const templateHtml = await readFromFile(
      `./src/html/templates/${folderName}/template.html`
    );
    const $ = cheerio.load(templateHtml);
    return modifier + $("body").html().trim();
  }, "");
};

export const generateNewMapping = async (type) => {
  if (!["email", "microsite", "templates"].includes(type)) {
    throw new Error("type must be either 'email' or 'microsite'");
  }

  let html;

  if (type === "templates") {
    html = await newHtml();
    html = html.trim();
  } else html = await readFile(`./src/html/${type}/base1/template.html`);

  if (html.length < 100) {
    throw new Error("HTML is too short");
  }

  const mapping = await createMapping(html, type);
  if (type === "templates") {
    writeFile(
      `./src/html/${type}/json/mapping.json`,
      JSON.stringify(mapping, null, 2)
    );
  } else {
    writeFile(
      `./src/html/${type}/base1/json/mapping.json`,
      JSON.stringify(mapping, null, 2)
    );
  }
  return mapping;
};

export const generateMapping = async (type, tempFilePath) => {
  const file = await readFile(`./src/html/${type + (type === "templates" ? "" : "/base1")}/json/mapping.json`);
  writeFile(tempFilePath, file);
  return file;
};

generateNewMapping('templates');