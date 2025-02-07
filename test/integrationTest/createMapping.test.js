import request from 'supertest';
import app from '../../index';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe.only("Mapping API", () => {
    const filePath = path.resolve(__dirname, '../../.env/force23');
    let response;

    beforeAll( async () => {
        response = await request(app).post('/api/create-mapping/templates/force23');
    }, 20000)

    /*afterAll(() => {
        if (fs.existsSync(filePath)) {
          fs.rmSync(filePath, { recursive: true, force: true });
        }
    });*/

    // render preview test - can delete this if necessary

    test("createMapping",  () => {
        expect(response.status).toBe(201);
        expect(fs.existsSync(filePath + '/templates/json/mapping.json')).toBe(true);
    });

    test("check output", () => {
        const data = JSON.parse(fs.readFileSync(filePath + '/templates/json/mapping.json', "utf8"));
        const keys = Object.keys(data);
        expect(keys.length).toBe(3);
        const colors = Object.values(data.color).map(color => color.oldColor);
        
        expect(colors.length).toBe(3);
        expect(colors).toContain("rgb(201, 255, 247)");
        expect(colors).toContain("rgb(7, 190, 0)");
        expect(colors).toContain("rgb(34, 30, 30)");
    })

})