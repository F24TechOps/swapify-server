import { createZip } from "./emailZip.js";

const company = process.argv[2] ?? 'force';

const dest = process.argv[3] ?? `./.env/${company}/email/final/${company}-templates.zip`;

const imagePath = `./.env/${company}/email/final/images`;
const htmlPath = `./.env/${company}/email/final/template.html`;

createZip(htmlPath, imagePath, dest);