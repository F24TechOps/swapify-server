import request from 'supertest';
import app from '../../index.js';

describe.skip('POST /api/create-download', () => {
  it('should return 200 on valid request', async () => {
    const response = await request(app)
      .post('/api/create-download')
      .send({
        type: 'templates', 
        company: 'new', 
      });
      
    expect(response.status).toBe(200);
  });
});
