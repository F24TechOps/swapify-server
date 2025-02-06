import { readAndRun, readFile } from "./runAll.js";

const jsonData = await readFile('./.env/json/microsite.json');
const update = JSON.parse(jsonData);

const selections = {replaceId: true, flatten: true, update};

await readAndRun('./src/html/microsite/base1/microsite.html', `.env/microsite.html`, selections, 'microsite');
