import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import { createZip } from "./emailZip.js";
import { downloadImage } from "./downloadImage.js";
import { readFile, writeFile } from "./runAll.js";

export const processTemplate = async (
  templateName,
  htmlPath,
  imagePath,
  zipDest
) => {

  if (!fs.existsSync(htmlPath)) {
    console.warn(`Skipping template '${templateName}' - no HTML file found.`);
    return;
  }

  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath, { recursive: true });
  }

  try {
    const htmlContent = await readFile(htmlPath);

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

    await writeFile(htmlPath, $.html());

    await createZip(htmlPath, imagePath, zipDest);

    return zipDest;
  } catch (error) {
    console.error(`Error processing template '${templateName}':`, error);
    throw error;
  }
};
