import request from 'supertest';
import app from '../index';

describe('API Tests', () => {
  describe('GET /healthz', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app).get('/healthz');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('GET /v1/meta', () => {
    it('should return metadata', async () => {
      const response = await request(app).get('/v1/meta');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptimeSec');
    });
  });

  describe('POST /v1/auth/register', () => {
    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({ email: 'invalid-email', password: 'password123' });
      expect(response.status).toBe(400);
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({ email: 'test@example.com', password: '123' });
      expect(response.status).toBe(400);
    });
  });
});
