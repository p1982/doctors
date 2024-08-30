import request from 'supertest';
import express from 'express';
import App from '../src/server/app.ts';

class TestController {
  public path = '/test';
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.testRoute);
  }

  private testRoute = (req: express.Request, res: express.Response) => {
    res.send('Test route');
  };
}

describe('App', () => {
  let app: App;

  beforeAll(() => {
    const testController = new TestController();
    app = new App([testController], 3000, 'localhost');
  });

  it('should respond with "Hello, World!" on the root path', async () => {
    const response = await request(app.app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, World!');
  });

  it('should respond with "Test route" on the /api/test path', async () => {
    const response = await request(app.app).get('/api/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Test route');
  });
});
