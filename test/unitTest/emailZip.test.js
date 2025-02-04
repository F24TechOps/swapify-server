import { beforeAll, test } from "@jest/globals";
import { createZip } from "../../src/backend/emailZip.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import request from "supertest";
import app from "../../index";
import server from "../../listen.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.resolve(
  __dirname,
  `../../.env/force23/templates/abandoned/final/template.html`
);
const imagePath = path.join(
  __dirname,
  `../../.env/force23/templates/abandoned/final/images`
);
const dest = path.resolve(
  __dirname,
  `../../.env/force23/templates/abandoned/final/abandoned.zip`
);

beforeAll(() => {
  // if (!fs.existsSync(imagePath)) {
  //   fs.mkdirSync(imagePath, { recursive: true });
  // }
});

afterAll((done) => {
  server.close(done);
});

describe("adds images to image folder, zips emails, downloads", () => {
  // it.skip("zips emails", () => {
  //   createZip(htmlPath, imagePath, dest);
  //   expect(fs.existsSync(dest)).toBe(true);
  // });
  it("creates image path and downloads for type templates", async () => {
    const res = await request(app)
      .post("/api/create-download")
      .send({
        type: "templates",
        company: "force23"
      });
    const testFilePath = path.join(
      __dirname,
      `../../.env/force23/templates/abandoned/final/images/ImageLink1.png`
    );
    expect(fs.existsSync(testFilePath)).toBe(true);
  });
});
