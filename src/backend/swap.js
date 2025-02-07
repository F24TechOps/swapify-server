import { readAndRun, readFile } from "./runAll.js";

const type = process.argv[2];
const company = process.argv[3] ?? 'force';

if (!['email', 'microsite', 'templates'].includes(type))
    throw new Error("type must be either 'email', 'microsite', or 'templates'");

const jsonData = await readFile(`./.env/${company}/${type}/json/mapping.json`, 'utf8');
const update = JSON.parse(jsonData);

const selections = {replaceId: false, flatten: false, update};

await readAndRun(`./src/html/${type}/base1/template.html`, `./.env/${company}/${type}/final/template.html`, selections, type);
