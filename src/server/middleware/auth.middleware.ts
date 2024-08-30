import * as express from 'express';
import * as crypto from 'crypto';
import config from '../../config/index.ts';

interface RequestWithAuth extends express.Request {
  auth?: any;
  payload?: {
    role?: string;
  };
}

export function isAuthenticated(
  req: RequestWithAuth,
  res: express.Response,
  next: express.NextFunction,
) {
  const token = req.headers['x-access-token'] as string | undefined;
  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }

  const secret: string = config.get('SECRET_KEY');
  const [headerEncoded, payloadEncoded, signature] = token.split('.');

  if (!headerEncoded || !payloadEncoded || !signature) {
    return res.status(400).send('Invalid Token Format');
  }

  const newSignature = crypto
    .createHmac('sha256', secret)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (newSignature !== signature) {
    return res.status(401).send('Invalid Token');
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadEncoded, 'base64').toString(),
    );
    req.auth = payload;
    req.payload = {
      role: payload.role,
    };
    next();
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
}
