import { createMapping } from "./mapping.js";
import { readFile, writeFile } from "./runAll.js";

export const generateMapping = async (type, company) => {
  if (!['email', 'microsite', 'templates'].includes(type)) {
    throw new Error("type must be either 'email' or 'microsite'");
  }

  let html;
  
  if (type === "templates")
    html = readFile('./src/html/templates/event/template.html');
  else
    html = readFile(`./src/html/${type}/base1/template.html`);
  
  if (html.length < 100) {
    throw new Error("HTML is too short")
  }
  
  const mapping = await createMapping(html, type);
  writeFile(`./.env/${company}/${type}/json/mapping.json`, JSON.stringify(mapping, null, 2));
  return mapping;
};
