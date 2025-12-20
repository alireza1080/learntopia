import { Request, Response, NextFunction } from 'express';
import { prisma } from 'services/db.service.ts';
import verifyToken from 'utils/verifyToken.util.ts';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //! Get token from headers
        const token = req.headers.authorization?.split(' ')[1];
        //! Next if token is not provided
        if (!token) {
            return next();
        }
        
        //! Verify token
        const decoded = await verifyToken(token);

        //! Next if token is not valid
        if (!decoded) {
            req.token = null;
            return next();
        }

        //! Set token in request
        req.token = decoded;
        
        //! Find user by id
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            },
        });

        //! Next if user is not found
        if (!user) {
            req.user = null;
            return next();
        }

        //! Set user in request
        req.user = user;
        
        return next();
    } catch (error) {
        console.error('Error authenticating user', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default authMiddleware;