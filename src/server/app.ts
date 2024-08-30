import express from 'express';
import formidable from 'express-formidable';
import session from 'express-session';
import errorHandle from './utils/errorHandle.ts';
import { logRequest } from './utils/logger.ts';

const fieldsToBody = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (req['fields']) {
    req.body = req['fields'];
  }
  next();
};

class App {
  public app: express.Application;
  public port: number;
  public host: string;
  private server: any;
  constructor(controllers: Array<any>, port: number, host: string) {
    this.app = express();
    this.port = port;
    this.host = host;
    this.initializeMiddlewares();
    this.setupRoutes(controllers);
    this.initializeErrorHandle();
    this.server = null;
  }

  private initializeMiddlewares() {
    this.app.use(express.static('public'));
    this.app.use(
      session({
        secret: 'secret',
        cookie: { maxAge: 60000 },
        resave: false,
        saveUninitialized: false,
      }),
    );
    this.app.use(formidable());
    this.app.use(fieldsToBody);
    this.app.use(logRequest);
  }

  private initializeErrorHandle() {
    this.app.use(errorHandle);
  }

  private setupRoutes(controllers: Array<any>) {
    this.app.get('/', (req, res) => {
      res.send('Hello, World!');
    });

    controllers.forEach(controller => {
      this.app.use(`/api${controller.path}`, controller.router);
    });
  }

  public listen() {
    this.server = this.app.listen(this.port, this.host, () => {
      console.log(`App listening on http://${this.host}:${this.port}`);
    });
  }
  public async close() {
    // Method to close the server
    if (this.server) {
      this.server.close();
    }
  }
}

export default App;
