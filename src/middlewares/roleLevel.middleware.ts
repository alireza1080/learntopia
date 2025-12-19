import { Request, Response, NextFunction } from 'express';

const roleLevelMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //! Check if user is authenticated
    if (!req.user) {
      req.roleLevel = 0;
      return next();
    }

    const userRole = req.user.role;

    switch (userRole) {
      case 'ADMIN':
        req.roleLevel = 3;
        break;
      case 'TEACHER':
        req.roleLevel = 2;
        break;
      case 'USER':
        req.roleLevel = 1;
        console.log(userRole);
        break;
      default:
        req.roleLevel = 0;
    }

    return next();
  } catch (error) {
    console.error('Error checking role level', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default roleLevelMiddleware;
