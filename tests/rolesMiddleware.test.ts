import express from 'express';
import request from 'supertest';
import { rolesValidation } from '../src/server/middleware/roles.middleware.ts';

// This function creates a token that matches the expected format for your middleware
const createToken = (role: string) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64')
    .replace(/=/g, '');
  const payload = Buffer.from(
    JSON.stringify({
      role,
      sub: 'f@gmail.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  )
    .toString('base64')
    .replace(/=/g, '');
  const signature = 'N6y...'; // Simplified signature for testing; normally generated using a secret key

  return `${header}.${payload}.${signature}`;
};

describe('rolesValidation Middleware', () => {
  const app = express();
  app.use(express.json());

  app.get(
    '/admin',
    rolesValidation(['admin']),
    (req: express.Request, res: express.Response) => {
      res.status(200).send('Admin Access');
    },
  );

  app.get(
    '/user',
    rolesValidation(['user', 'admin']),
    (req: express.Request, res: express.Response) => {
      res.status(200).send('User Access');
    },
  );

  it('should return 403 if no token is provided', async () => {
    const response = await request(app).get('/admin');
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access forbidden: insufficient rights');
  });

  it('should return 403 if user does not have sufficient rights', async () => {
    const token = createToken('user');
    const response = await request(app)
      .get('/admin')
      .set('x-access-token', token);
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access forbidden: insufficient rights');
  });

  it('should return 200 if user has sufficient rights', async () => {
    const token = createToken('admin');
    const response = await request(app)
      .get('/admin')
      .set('x-access-token', token);
    expect(response.status).toBe(200);
    expect(response.text).toBe('Admin Access');
  });

  it('should return 200 if user has one of the sufficient rights', async () => {
    const token = createToken('user');
    const response = await request(app)
      .get('/user')
      .set('x-access-token', token);
    expect(response.status).toBe(200);
    expect(response.text).toBe('User Access');

    const adminToken = createToken('admin');
    const adminResponse = await request(app)
      .get('/user')
      .set('x-access-token', adminToken);
    expect(adminResponse.status).toBe(200);
    expect(adminResponse.text).toBe('User Access');
  });
});
