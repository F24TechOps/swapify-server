import express from "express";
import path from "path";
import { generateMapping } from "./src/backend/createMap.js";
import { readAndRun, readFile } from "./src/backend/runAll.js";
import { downloadImage } from "./src/backend/downloadImage.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { processTemplate } from "./src/backend/processTemplate.js";
import { cropCircle } from "./src/imageformatter/createCircle.js";
import { starColour } from "./src/imageformatter/editStarColour.js";
import cors from "cors";
import dotenv from "dotenv";
import { listFolders } from "./src/backend/readFolders.js";
import JSZip from "jszip";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../frontend/build")));

//tested
app.get("/api/:type/template", (req, res) => {
  const { type } = req.params;
  let templateName = req.query.name;
  const templateFileNames = [
    "abandoned",
    "anniversary",
    "blog",
    "Confirmation Email 1",
    "confirmation1",
    "confirmation2",
    "event",
    "Meet The Team",
    "nps1",
    "nps2",
    "nurture1",
    "nurture2",
    "prompt",
    "testimonial",
    "webinar1",
    "webinar2",
  ];

  let filePath;

  if (type === "templates") {
    if (templateName && templateFileNames.includes(templateName)) {
      filePath = path.join(
        __dirname,
        `./src/html/templates/${templateName}/template.html`
      );
    } else if (
      !templateFileNames.includes(templateName) &&
      templateName !== undefined
    ) {
      res.status(400).send(`${templateName} isn't an accepted template type`);
    } else {
      filePath = path.join(
        __dirname,
        `./src/html/templates/abandoned/template.html`
      );
    }

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.status(404).send(`${type} isn't an accepted template type`);
        return;
      }

      const updatedHtml = data.replace(
        /src=['"]images\//g,
        `src="/templates/${templateName}/images/`
      );
      res.status(200).send(updatedHtml);
    });
  } else {
    filePath = path.join(__dirname, `./src/html/${type}/base1/template.html`);

    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send(`${type} isn't an accepted template type`);
      } else {
        res.status(200);
      }
    });
  }
});

//IDEA:
// app.post("/api/:type/template", (req, res) => {
//   const { type } = req.params;
//   const { htmlInput } = req.body;

//   const filePath = path.join(
//     __dirname,
//     `./src/html/${type}/base1/template.html`
//   );

//   try {
//     fs.writeFileSync(filePath, htmlInput, "utf-8");

//     res.status(201).send("template created");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error creating template");
//   }
// });

//tested
app.get("/api/:type/:company/final-template", (req, res) => {
  const { type, company } = req.params;
  let filePath = path.join(
    __dirname,
    `./.env/${company}/${type}/final/template.html`
  );

  if (type === "templates") {
    filePath = path.join(
      __dirname,
      `./.env/${company}/${type}/abandoned/final/template.html`
    );
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

//tested
app.get("/api/mapping/:type/:company", (req, res) => {
  const { type, company } = req.params;
  const filePath = path.join(
    __dirname,
    `./.env/${company}/${type}/json/mapping.json`
  );

  if (path.extname(filePath) !== ".json") {
    res.status(400).send("Not a JSON file");
    return;
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

//tested
app.post("/api/create-download", async (req, res) => {
  const { type, company, imageUrls } = req.body;

  if (!["email", "templates", "microsite"].includes(type)) {
    return res.status(404).send("Invalid type specified");
  }

  try {
    if (type === "microsite") {
      const htmlPath = path.join(
        __dirname,
        `./.env/${company}/microsite/final/template.html`
      );
      const copyText = fs.readFileSync(htmlPath, "utf8");
      return res.status(200).send(copyText);
    }

    if (type === "email") {
      const zipPath = await processTemplate(res, company, "email", imageUrls);
      return res.download(zipPath, "email.zip");
    }

    if (type === "templates") {
      const templateFolders = await listFolders(
        path.join(__dirname, `./.env/${company}/templates`)
      );

      const zipPaths = await Promise.all(
        templateFolders.map((templateName) =>
          processTemplate(res, company, templateName, imageUrls, true)
        )
      );

      const validZipPaths = zipPaths.filter((zip) => {
        if (zip !== null && zip !== undefined) {
          return zip;
        }
      });

      if (validZipPaths.length === 0) {
        return res
          .status(500)
          .send("Error: No templates were successfully zipped");
      }

      const masterZip = new JSZip();
      const masterZipPath = path.join(
        __dirname,
        `./.env/${company}/${company}-templates.zip`
      );

      for (const zipPath of validZipPaths) {
        const zipFilename = path.basename(zipPath);
        const zipData = fs.readFileSync(zipPath);
        masterZip.file(zipFilename, zipData);
      }

      const masterZipBuffer = await masterZip.generateAsync({
        type: "nodebuffer",
      });
      fs.writeFileSync(masterZipPath, masterZipBuffer);
      
      return res.download(masterZipPath, `${company}-templates.zip`
    );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    if (!res.headersSent) {
      res.status(400).send(`Error processing request: ${error.message}`);
    }
  }
});

//tested
app.post("/api/create-mapping/:type/:company", async (req, res) => {
  const { type, company } = req.params;
  const mapping = await generateMapping(type, company);
  const filePath = path.join(
    __dirname,
    `./.env/${company}/${type}/json/mapping.json`
  );

  if (!mapping) {
    res.status(400).send("HTML content is required");
  }

  fs.writeFileSync(filePath, JSON.stringify(mapping, null, 2), "utf8");
  res.status(201).send("Mapping created");
});

//tested
app.delete("/api/delete-company/:company", async (req, res) => {
  const { company } = req.params;
  const filePath = path.join(__dirname, `./.env/${company}`);

  fs.rmSync(filePath, { recursive: true, force: true });

  try {
    fs.rmSync(filePath, { recursive: true, force: true });
    res.status(200).send("Company deleted");
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).send("Error deleting company");
  }
});

//tested
app.post("/api/swap", async (req, res) => {
  const { type, company } = req.body;

  try {
    if (!["email", "microsite", "templates"].includes(type))
      throw new Error(
        "type must be either 'email', 'microsite', or 'templates'"
      );

    const jsonData = readFile(
      `./.env/${company}/${type}/json/mapping.json`,
      "utf8"
    );
    const update = JSON.parse(jsonData);

    const selections = { replaceId: false, flatten: false, update };

    if (type === "templates") {
      const folders = await listFolders(`./src/html/templates`);

      folders.forEach((folder) => {
        readAndRun(
          `./src/html/templates/${folder}/template.html`,
          `./.env/${company}/${type}/${folder}/final/template.html`,
          selections,
          type
        );
      });
    } else {
      readAndRun(
        `./src/html/${type}/base1/template.html`,
        `./.env/${company}/${type}/final/template.html`,
        selections,
        type
      );
    }
    res.status(200).send("Swap script executed successfully");
  } catch (error) {
    console.error(`Error executing swap script: ${error}`);
    return res
      .status(400)
      .send(`Error executing swap script: ${error.message}`);
  }
});

//tested
app.patch("/api/update-mapping/:type/:company", async (req, res) => {
  const { type, company } = req.params;
  const mappingData = req.body;

  const filePath = path.join(
    __dirname,
    `./.env/${company}/${type}/json/mapping.json`
  );

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File does not exist");
    }

    const fileData = fs.readFileSync(filePath, "utf8");
    const existingMappingData = JSON.parse(fileData);

    const updatedMappingData = {
      ...existingMappingData,
      ...mappingData,
    };

    fs.writeFileSync(
      filePath,
      JSON.stringify(updatedMappingData, null, 2),
      "utf8"
    );

    res.status(200).send("Mapping updated successfully");
  } catch (error) {
    // console.error("Error updating mapping:", error);
    res.status(500).send("Error updating mapping");
  }
});

app.post("/api/process-circle", async (req, res) => {
  const { company, imageKey, imageUrl } = req.body;
  const imagePath = path.join(
    __dirname,
    `./.env/${company}/email/final/images`
  );

  try {
    // Ensure the images directory exists
    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath, { recursive: true });
    }

    const filename = path.join(imagePath, `${imageKey}.png`);
    await downloadImage(imageUrl, filename);
    await cropCircle(filename, filename);

    res.status(200).send("Circle image processed");
  } catch (err) {
    console.error("Error processing circle image:", err);
    res.status(500).send("Error processing circle image");
  }
});

app.post("/api/process-star", async (req, res) => {
  const { company, replaceColor, imageUrls } = req.body;
  const starImages = [];
  const imagePath = path.join(
    __dirname,
    `./.env/${company}/email/final/images`
  );

  try {
    // Ensure the images directory exists
    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath, { recursive: true });
    }

    // Download images and identify star images
    for (const [key, url] of Object.entries(imageUrls)) {
      const filename = path.join(imagePath, `${key}.png`);
      await downloadImage(url, filename);

      if (url.includes("star-")) {
        starImages.push(filename);
      }
    }

    // Process star images to change color
    if (replaceColor && starImages.length > 0) {
      await starColour(imagePath, replaceColor, starImages);
    }

    res.status(200).send("Star color processed");
  } catch (err) {
    console.error("Error processing star color:", err);
    res.status(500).send("Error processing star color");
  }
});

app.get("/*", (req, res) => {
  res.send("Hello World");
});

export default app;
