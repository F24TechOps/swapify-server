import { createMapping } from "./mapping.js";
import { readFile, writeFile } from "./runAll.js";
import { listFolders, readFromFile } from "./readFolders.js";
import { JSDOM } from 'jsdom';

export const generateMapping = async (type, company) => {
  if (!['email', 'microsite', 'templates'].includes(type)) {
    throw new Error("type must be either 'email' or 'microsite'");
  }

  let html;
  
  if (type === "templates") {
    const allFolders = await listFolders('./src/html/templates');
    html = allFolders.reduce((modifier, folderName) => {
      const newHtml = readFromFile(`./src/html/templates/${folderName}/template.html`);
      const dom = new JSDOM(newHtml);
      return modifier + dom.window.document.body.innerHTML.trim();
    }, "");
    html = html.trim();
  }
  else
    html = readFile(`./src/html/${type}/base1/template.html`);
  
  if (html.length < 100) {
    throw new Error("HTML is too short")
  }
  
  const mapping = await createMapping(html, type);
  writeFile(`./.env/${company}/${type}/json/mapping.json`, JSON.stringify(mapping, null, 2));
  return mapping;
};
