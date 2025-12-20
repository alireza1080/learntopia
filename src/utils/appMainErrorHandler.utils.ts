import { NextFunction } from 'express';
import { Request, Response } from 'express';

const appMainErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if the error is a JSON parsing error from express.json()
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({
      message: 'Invalid JSON format in request body',
    });
  }

  // Handle other unexpected errors
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
};

export default appMainErrorHandler;
