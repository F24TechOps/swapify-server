import { cropCircle } from './createCircle.js';

const company = process.argv[2] ?? 'force';

const inputFile = process.argv[3] ?? `./.env/${company}/email/final/images/portrait.png`;

const outputFile = `./.env/${company}/email/final/images/circle.png`;

cropCircle(inputFile, outputFile);