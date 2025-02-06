import { afterAll, beforeAll } from "@jest/globals";
import request from "supertest";
import path from "path";
import app from "../../index.js";
import { fileURLToPath } from "url";
import server from "../../listen.js";
import { listFolders } from "../../src/backend/readFolders.js";
import fs from 'fs';
import { readFromFile } from "../../src/backend/readFolders.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("swap endpoint logic", () => {
    const testCompany = "force23";
    const testType = "templates";
    const envPath = path.resolve(__dirname, `../../.env/${testCompany}/${testType}`);
    
    let response;

    beforeAll(async () => {
        response = await request(app).post('/api/swap').send({type: testType, company: testCompany})
        // await request(app).patch(`/api/update-mapping/templates/force23`).send({
        //     "links": {
        //       "Link0": {
        //         "oldLink": "https://www.force24.co.uk",
        //         "newLink": "just for a laugh"
        //       }
        //     },
        //     "images": {
        //       "ImageLink0": {
        //         "oldImageLink": "https://s3.eu-west-2.amazonaws.com/force24-assets/EmailTemplates/AccountTemplates/de796d11/cbe0c6e8/images/1712575426-3693fdeb.png?v=133825448144145042",
        //         "newImageLink": null
        //       }
        //     },
        //     "color": {
        //       "Color0": {
        //         "oldColor": "rgb(201, 255, 247)",
        //         "newColor": null
        //       },
        //       "Color1": {
        //         "oldColor": "rgb(34, 30, 30)",
        //         "newColor": null
        //       },
        //       "Color2": {
        //         "oldColor": "rgb(7, 190, 0)",
        //         "newColor": null
        //       }
        //     }
        //   })
    })

    afterAll((done) => {
        server.close(done);
    })

    it("should return a successful response", () => {
        expect(response.status).toBe(200);
        expect(response.text).toContain("Swap script executed successfully");
    });

    it("should create the expected template folders", async () => {
        const folders = await listFolders(envPath);
        expect(folders.length).toBeGreaterThan(0);
    });

    it("should read and parse the update mapping JSON file", async () => {
        const jsonData = await readFromFile(`${envPath}/json/mapping.json`);
        const parsedData = JSON.parse(jsonData);
        expect(parsedData).toHaveProperty("color.Color0.oldColor", "rgb(201, 255, 247)");
    });

    it.skip("should process multiple HTML templates and create final templates", async () => {
        const folders = await listFolders(`./src/html/${testType}`);

        folders.forEach(folder => {

            const finalFilePath = `./.env/${testCompany}/${testType}/${folder}/final/template.html`;

            expect(fs.existsSync(__dirname, finalFilePath)).toBe(true);

            const finalHtml = fs.readFileSync(finalFilePath, "utf8");

            expect(finalHtml).toContain("https://www.twelvepmtest.com");
            expect(finalHtml).not.toContain("https://www.force24.co.uk");

            // expect(finalHtml).toContain("https://lh3.googleusercontent.com/a/AEdFTp4agSbGgUSXNgSW7lNDEuvDELVFw_fYynOXdoV7mw=s96-c");
        
            // expect(finalHtml).not.toContain("https://s3.eu-west-2.amazonaws.com/force24-assets/EmailTemplates/AccountTemplates/de796d11/cbe0c6e8/images/1712575426-3693fdeb.png?v=133825448144145042");
    
            expect(finalHtml).toMatch(/rgb\(255,\s*0,\s*0\)/); 
            expect(finalHtml).toMatch(/rgb\(0,\s*0,\s*255\)/); 
            expect(finalHtml).toMatch(/rgb\(255,\s*0,\s*255\)/); 
    
            expect(finalHtml).not.toMatch(/rgb\(201,\s*255,\s*247\)/); 
            expect(finalHtml).not.toMatch(/rgb\(34,\s*30,\s*30\)/); 
            expect(finalHtml).not.toMatch(/rgb\(7,\s*190,\s*0\)/);
        });
    });
});
