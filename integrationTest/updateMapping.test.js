import request from 'supertest';
import app from '../index';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Mapping API", () => {
    const filePath = path.resolve(__dirname, '../.env/force23');

    afterAll(() => {
        if (fs.existsSync(filePath)) {
          fs.rmSync(filePath, { recursive: true, force: true });
        }
    });

    test("createMapping", async () => {
        const response = await request(app).post('/api/create-mapping/email/force23');
        expect(response.status).toBe(201);
        expect(fs.existsSync(filePath + '/email/json/mapping.json')).toBe(true);
    }, 10000);
})