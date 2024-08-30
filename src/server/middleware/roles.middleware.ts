import * as express from 'express';

interface RequestWithRoles extends express.Request {
  payload?: {
    role?: string;
  };
}

export const rolesValidation = (roles: string[]) => {
  return (
    req: RequestWithRoles,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const token = req.headers['x-access-token'];

    if (!token) {
      return res
        .status(403)
        .json({ message: 'Access forbidden: insufficient rights' });
    }

    // Ensure that token is a string
    const tokenString = Array.isArray(token) ? token[0] : token;
    const parts = tokenString.split('.');
    const payloadEncoded = parts[1];
    const payloadDecoded = Buffer.from(payloadEncoded, 'base64').toString(
      'utf-8',
    );
    const payload = JSON.parse(payloadDecoded);
    const role = payload.role;
    if (!roles.includes(role)) {
      return res
        .status(403)
        .json({ message: 'Access forbidden: insufficient rights' });
    }

    req.payload = { role }; // Setting the role in the payload
    next();
  };
};
