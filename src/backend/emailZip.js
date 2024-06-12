import fs from "fs";
import JSZip from "jszip";
import path from "path";

export const createZip = (htmlPath, imagePath, dest) => {
  return new Promise((resolve, reject) => {
    const zip = new JSZip();

    try {
      const html = fs.readFileSync(htmlPath);
      zip.file("template.html", html);

      const images = fs.readdirSync(imagePath);

      images.forEach((image) => {
        const filePath = path.join(imagePath, image);
        const content = fs.readFileSync(filePath);
        zip.file(`images/${image}`, content);
      });

      zip
        .generateAsync({ type: "nodebuffer" })
        .then((content) => {
          fs.writeFileSync(dest, content);
          resolve();
        })
        .catch((err) => {
          // console.error("Error creating zip file:", err);
          reject(err);
        });
    } catch (err) {
      // console.error(`error reading files:`, err);
      reject(err);
    }
  });
};
