import { createMapping } from "./mapping.js";
import { readFile, writeFile } from "./runAll.js";
import { listFolders, readFromFile } from "./readFolders.js";
import * as cheerio from "cheerio";

export const generateMapping = async (type, company) => {
  if (!['email', 'microsite', 'templates'].includes(type)) {
    throw new Error("type must be either 'email' or 'microsite'");
  }

  let html;
  
  if (type === "templates") {
    const allFolders = await listFolders('./src/html/templates');
    html = allFolders.reduce((modifier, folderName) => {
      const newHtml = readFromFile(`./src/html/templates/${folderName}/template.html`);
      const $ = cheerio.load(newHtml);
      return modifier + $('body').html().trim();
    }, "");
    html = html.trim();
  } else {
    html = readFile(`./src/html/${type}/base1/template.html`);
  }
  
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

export const generateCompanyMapping = (type, company) => {
  
}

generateMapping('templates')
