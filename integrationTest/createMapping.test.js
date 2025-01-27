import request from 'supertest';
import app from '../index';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Mapping API", () => {
    const filePath = path.resolve(__dirname, '../.env/force23');
    let response;

    beforeAll( async () => {
        response = await request(app).post('/api/create-mapping/email/force23');
    }, 10000)

    afterAll(() => {
        if (fs.existsSync(filePath)) {
          fs.rmSync(filePath, { recursive: true, force: true });
        }
    });

    test("createMapping",  () => {
        expect(response.status).toBe(201);
        expect(fs.existsSync(filePath + '/email/json/mapping.json')).toBe(true);
    });

    test("check output", () => {
        const data = JSON.parse(fs.readFileSync(filePath + '/email/json/mapping.json', "utf8"));
        const keys = Object.keys(data);
        expect(keys.length).toBe(4);
        const backgrounds = Object.values(data.backgroundColors).map(color => color.oldBackground);

        expect(backgrounds).toContain("rgb(201, 255, 247)");
        expect(backgrounds).toContain("rgb(255, 255, 255)");
    })

})