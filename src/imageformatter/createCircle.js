import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

export const cropCircle = (inputFile, outputFile) => {
  return new Promise((resolve, reject) => {
    loadImage(inputFile).then(img => {
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
    
      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);
    
      // Calculate the center of the image
      const centerX = img.width / 2;
      const centerY = img.height / 2;
    
      // Calculate the radius of the circle
      const radius = Math.min(centerX, centerY);
    
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    
      // Draw a transparent circular path
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
    
      // Clip the context to the circular path
      ctx.clip();
    
      // Draw the image onto the canvas (only the clipped region will be drawn)
      ctx.drawImage(img, 0, 0);
    
      // Get the bounding box of the circular region
      const boundingBox = ctx.getImageData(centerX - radius, centerY - radius, radius * 2, radius * 2);
    
      // Create a new canvas with dimensions fitting the bounding box
      const trimmedCanvas = createCanvas(boundingBox.width, boundingBox.height);
      const trimmedCtx = trimmedCanvas.getContext('2d');
    
      // Draw the circular region onto the new canvas
      trimmedCtx.putImageData(boundingBox, 0, 0);
    
      // Save the trimmed canvas as a PNG file
      const out = fs.createWriteStream(outputFile);
      const stream = trimmedCanvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
    }).catch(err => {
      console.error('Error loading image:', err);
      reject(err);
    });
  });
}
