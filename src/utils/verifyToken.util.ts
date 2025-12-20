import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const verifyToken = async (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        return decoded;
    } catch (error) {
        // console.error('Error verifying token', error);
        return null;
    }
};

export default verifyToken;