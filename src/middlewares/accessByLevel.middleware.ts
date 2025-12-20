import { Request, Response, NextFunction } from 'express';

const accessByLevelMiddleware = (
  accessLevel: Array<0 | 1 | 2 | 3>,
  customMessage?: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (accessLevel.includes(req.roleLevel as 0 | 1 | 2 | 3)) {
        return next();
      }

      return res
        .status(403)
        .json({ message: customMessage || 'Access denied' });
    } catch (error) {
      console.error('Error checking access level', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

export default accessByLevelMiddleware;
