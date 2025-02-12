import { updateHtmlContent } from "../../src/backend/templateChange.js";
import { JSDOM } from "jsdom";
import fs, { writeFile } from "fs";
import path from "path";

let filledJson = {
  links: {
    Link0: {
      oldLink: "https://www.force24.co.uk",
      newLink: "https://new-link.com",
    },
  },
  images: {
    ImageLink0: {
      oldImageLink:
        "https://s3.eu-west-2.amazonaws.com/force24-assets/EmailTemplates/AccountTemplates/de796d11/cbe0c6e8/images/1712575426-3693fdeb.png?v=133825448144145042",
      newImageLink:
        "https://images.pexels.com/photos/30359820/pexels-photo-30359820/free-photo-of-intricate-moorish-archways-in-alhambra-palace-spain.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
  },
  color: {
    Color0: {
      oldColor: "rgb(201, 255, 247)",
      newColor: "rgb(0, 0, 247)",
    },
    Color1: {
      oldColor: "rgb(7, 190, 0)",
      newColor: "rgb(7, 0, 0)",
    },
    Color2: {
      oldColor: "rgb(34, 30, 30)",
      newColor: "rgb(250, 250, 0)",
    },
  },
};

const html = fs.readFileSync(
  "./src/html/templates/abandoned/template.html",
  "utf-8"
);
const filePath = "./.env/interviewtest/templates/json/template.html";
const dir = path.dirname(filePath);

// Ensure the directory exists
fs.mkdir(dir, { recursive: true }, (err) => {
  if (err) {
    console.error("Error creating directory:", err);
    return;
  }

  // Write the file after ensuring the directory exists
  fs.writeFile(
    filePath,
    updateHtmlContent(html, filledJson, "templates"),
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
      }
    }
  );
});
