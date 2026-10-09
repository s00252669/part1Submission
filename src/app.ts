import express, { Request, Response, NextFunction } from 'express';
import { logger } from './middleware/logger.middleware';

export const app = express();

app.use(express.json());
app.use(logger);

app.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ message: 'hello from Ben' });
});

// Unknown route
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handler: catches malformed JSON in request bodies
app.use((err: Error & { type?: string }, req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Malformed JSON in request body' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});