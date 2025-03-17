import request from 'supertest';
import app from '../../index.js'; // adjust path as necessary

describe.skip('GET /api/dateTime/:interval', () => {
  const allowedIntervals = ['hour', 'day', '2days'];

  allowedIntervals.forEach((interval) => {
    test(`should return 200 for valid interval: ${interval}`, async () => {
      const response = await request(app).get(`/api/dateTime/${interval}`);
      expect(response.statusCode).toBe(200);
      console.log(response.body);
    });
  });

  test('should return 400 or 404 for invalid interval', async () => {
    const response = await request(app).get('/api/dateTime/invalidInterval');
    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });
});