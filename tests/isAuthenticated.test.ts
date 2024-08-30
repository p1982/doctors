import express from 'express';
import crypto from 'crypto';
import request from 'supertest';
import { isAuthenticated } from '../src/server/middleware/auth.middleware.ts';

jest.mock('../src/config/index', () => ({
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'SECRET_KEY') {
      return 'test_secret_key';
    }
    return null;
  }),
}));

describe('isAuthenticated Middleware', () => {
  const app = express();
  app.use(express.json());
  app.get(
    '/test',
    isAuthenticated,
    (req: express.Request, res: express.Response) => {
      res.status(200).send('Authenticated');
    },
  );

  it('should return 403 if no token is provided', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(403);
    expect(response.text).toBe('A token is required for authentication');
  });

  it('should return 401 if token format is invalid', async () => {
    const response = await request(app)
      .get('/test')
      .set('x-access-token', 'invalid.token.format');
    expect(response.status).toBe(401);
    expect(response.text).toBe('Invalid Token');
  });

  it('should return 401 if token signature is invalid', async () => {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64');
    const payload = Buffer.from(JSON.stringify({ role: 'user' })).toString(
      'base64',
    );
    const invalidSignature = 'invalid_signature';

    const token = `${header}.${payload}.${invalidSignature}`;

    const response = await request(app)
      .get('/test')
      .set('x-access-token', token);
    expect(response.status).toBe(401);
    expect(response.text).toBe('Invalid Token');
  });

  it('should return 200 if token is valid', async () => {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64');
    const payload = Buffer.from(JSON.stringify({ role: 'user' })).toString(
      'base64',
    );

    const signature = crypto
      .createHmac('sha256', 'test_secret_key')
      .update(`${header}.${payload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const token = `${header}.${payload}.${signature}`;

    const response = await request(app)
      .get('/test')
      .set('x-access-token', token);
    expect(response.status).toBe(200);
    expect(response.text).toBe('Authenticated');
  });
});
