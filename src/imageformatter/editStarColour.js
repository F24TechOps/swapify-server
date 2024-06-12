import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

export const starColour = async (directory, replaceColor, starFiles) => {
  const promises = starFiles.map(async (file) => {
    const img = await loadImage(file);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Loop through each pixel
    for (let j = 0; j < data.length; j += 4) {
      // Check if the pixel is not white
      if (data[j] !== 255 || data[j + 1] !== 255 || data[j + 2] !== 255) {
        // Replace non-white pixels with the specified color
        data[j] = parseInt(replaceColor.substring(1, 3), 16); // Red
        data[j + 1] = parseInt(replaceColor.substring(3, 5), 16); // Green
        data[j + 2] = parseInt(replaceColor.substring(5, 7), 16); // Blue
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const out = fs.createWriteStream(file);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    await new Promise((resolve) => out.on('finish', resolve));
  });

  await Promise.all(promises);
};
