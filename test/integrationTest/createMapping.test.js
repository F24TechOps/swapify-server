import request from 'supertest';
import app from '../../index';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Mapping API", () => {
    const filePath = path.resolve(__dirname, '../../.env/force26');
    let response;

    beforeAll( async () => {
        response = await request(app).post('/api/create-mapping/template/force26');
    }, 10000)

    /*afterAll(() => {
        if (fs.existsSync(filePath)) {
          fs.rmSync(filePath, { recursive: true, force: true });
        }
    });*/

    test("createMapping",  () => {
        expect(response.status).toBe(201);
        expect(fs.existsSync(filePath + '/template/json/mapping.json')).toBe(true);
    });

    test("check output", () => {
        const data = JSON.parse(fs.readFileSync(filePath + '/template/json/mapping.json', "utf8"));
        const keys = Object.keys(data);
        expect(keys.length).toBe(3);
        const colors = Object.values(data.color).map(color => color.oldColor);

        expect(colors.length).toBe(3);
        expect(colors).toContain("rgb(201, 255, 247)");
        expect(colors).toContain("rgb(7, 190, 0)");
        expect(colors).toContain("rgb(34, 30, 30)");
    })

})