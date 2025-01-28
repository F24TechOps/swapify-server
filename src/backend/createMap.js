import { createMapping } from "./mapping.js";
import { readFile, writeFile } from "./runAll.js";

export const generateMapping = async (type, company) => {
  if (!['email', 'microsite'].includes(type)) {
    throw new Error("type must be either 'email' or 'microsite'");
  }

  const html = readFile((type === 'microsite') ? `./src/html/${type}/base1/template.html` : './src/html/templates/confirmation1/template.html');
  
  if (html.length < 100) {
    throw new Error("HTML is too short")
  }
  
  const mapping = await createMapping(html, type);
  writeFile(`./.env/${company}/${type}/json/mapping.json`, JSON.stringify(mapping, null, 2));
  return mapping;
};
