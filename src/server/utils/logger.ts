import winston from 'winston';
import express from 'express';
// Init transports
const consoleTransport = new winston.transports.Console();
const fileErrorTransport = new winston.transports.File({
  filename: 'error.log',
  level: 'error',
});
const fileTransport = new winston.transports.File({ filename: 'combined.log' });

// Formatter
const { combine, timestamp, printf } = winston.format;
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${
    typeof message === 'object' ? JSON.stringify(message) : message
  }`;
});

const myWinstonOptions = {
  format: combine(timestamp(), myFormat),
  transports: [consoleTransport, fileTransport, fileErrorTransport],
};

const logger = winston.createLogger(myWinstonOptions);

export function logRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  logger.info(`${req.method}:${req.url}`);
  next();
}

export default logger;
