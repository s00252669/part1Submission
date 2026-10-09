import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const authenticateKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== env.apiKey) {
    res.status(401).json({ message: 'Unauthorised: missing or invalid API key' });
    return;
  }
  next();
};