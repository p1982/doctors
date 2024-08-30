import { Router, Request, Response } from 'express';
import { Service } from 'typedi';

@Service()
class TestController {
  public path = '/test';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.testRoute);
  }

  private testRoute = (req: Request, res: Response) => {
    res.status(200).json({ message: 'Test route' });
  };
}

export default TestController;
