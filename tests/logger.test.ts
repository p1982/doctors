import winston from 'winston';
import request from 'supertest';
import express from 'express';
import logger, { logRequest } from '../src/server/utils/logger.ts';

// Partially mock winston logger
jest.mock('winston', () => {
  const actualWinston = jest.requireActual('winston');
  return {
    ...actualWinston,
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      transports: [
        new actualWinston.transports.Console(),
        new actualWinston.transports.File({ filename: 'error.log' }),
      ],
      format: actualWinston.format,
    })),
  };
});

describe('Logger', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();

    // Use a basic error handling middleware
    app.use(logRequest);

    app.get('/test', (req, res) => {
      res.status(200).send('Test route');
    });

    app.get('/error', (req, res) => {
      throw new Error('Test error');
    });

    // Error handling middleware
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        logger.error('Error:', err);
        res.status(500).send('Internal Server Error');
      },
    );
  });

  it('should log the request method and URL', async () => {
    await request(app).get('/test');

    expect(logger.info).toHaveBeenCalledWith('GET:/test');
  });

  it('should log errors', async () => {
    const errorLogger = logger.error as jest.Mock;

    await request(app)
      .get('/error')
      .catch(() => {
        // Ignore the exception in the test, we're focusing on the logger
      });

    expect(errorLogger).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Error),
    );
  });
});
