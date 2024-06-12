import { starColour } from "./editStarColour.js";

const replaceColor = process.argv[3];
const company = process.argv[2] ?? 'force';

const directory = `./.env/${company}/email/final/images`;

starColour(directory, replaceColor);