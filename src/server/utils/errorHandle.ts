import { Request, Response, NextFunction } from 'express';
import { AppError } from './customErrors.ts';
import logger from './logger.ts';

const errorHandle = (err: Error, req: Request, res: Response) => {
  logger.error(err);
  if (err instanceof AppError) {
    return res.status(err.httpCode).json({ message: err.message }).send();
  }
  res.status(500).send('Something is wrong');
};

export default errorHandle;
