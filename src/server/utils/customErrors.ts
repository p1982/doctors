export enum HttpCode {
  OK = 200,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

interface AppErrorArgs {
  name?: string;
  httpCode?: HttpCode;
  message: string;
}

export class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpCode;

  constructor(args: AppErrorArgs) {
    super(args.message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = args.name || 'Error';
    this.httpCode = args.httpCode || HttpCode.INTERNAL_SERVER_ERROR;
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  constructor(args: AppErrorArgs) {
    super({ ...args, httpCode: args.httpCode || HttpCode.BAD_REQUEST });
  }
}
