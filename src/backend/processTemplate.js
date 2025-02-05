import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import { createZip } from "./emailZip.js";
import { downloadImage } from "./downloadImage.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processTemplate = async (
  res,
  company,
  templateName,
  imageUrls,
  isTemplate = false
) => {
  const basePath = isTemplate
    ? `./.env/${company}/templates/${templateName}/final`
    : `./.env/${company}/email/final`;
  const htmlPath = path.resolve(__dirname, `../../${basePath}/template.html`);
  const imagePath = path.join(__dirname, `../../${basePath}/images`);
  const zipDest = path.resolve(
    __dirname,
    `../../${basePath}/${templateName}.zip`
  );

  if (!fs.existsSync(htmlPath)) {
    console.warn(`Skipping template '${templateName}' - no HTML file found.`);
    return;
  }

  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath, { recursive: true });
  }

  try {
    const htmlContent = fs.readFileSync(htmlPath, "utf8");
    const $ = cheerio.load(htmlContent);
    const srcMapping = {};

    // ✅ Process images in the HTML
    const imageDownloadPromises = $("img")
      .map(async (index, element) => {
        let originalSrc = $(element).attr("src")?.split("?")[0];
        if (
          !originalSrc ||
          (!originalSrc.startsWith("http") && originalSrc.startsWith("images/"))
        )
          return;

        if (!srcMapping[originalSrc]) {
          const fileExtension =
            path.extname(originalSrc).split("?")[0] || ".png";

          const newKey = `ImageLink${Object.keys(srcMapping).length + 1}${fileExtension}`;
          const localPath = `images/${newKey}`;
          srcMapping[originalSrc] = localPath;
          const fullImagePath = path.join(imagePath, newKey);
          await downloadImage(originalSrc, fullImagePath);
        }
        $(element).attr("src", srcMapping[originalSrc]);
      })
      .get();

    await Promise.all(imageDownloadPromises);

    fs.writeFileSync(htmlPath, $.html(), "utf8");

    await createZip(htmlPath, imagePath, zipDest);

    return zipDest;
  } catch (error) {
    console.error(`Error processing template '${templateName}':`, error);
  }
};
