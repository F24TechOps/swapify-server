import http from "http";
import https from "https";
import fs from 'fs';

export const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith("https") ? https : http;
      const file = fs.createWriteStream(filename);
  
      protocol
        .get(url, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(() => resolve()); // Ensure file is fully written
            });
          } else {
            file.close();
            fs.unlinkSync(filename); // Delete partial file
            reject(`Failed to get '${url}' (${response.statusCode})`);
          }
        })
        .on("error", (err) => {
          file.close();
          fs.unlinkSync(filename); // Delete incomplete file
          reject(err.message);
        });
    });
  };