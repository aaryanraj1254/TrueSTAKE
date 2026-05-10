import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (error: Error, req: Request, res: Response) => {
  logger.error('unhandled_error', {
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.originalUrl,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
