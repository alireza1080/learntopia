import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const createToken = (userId: string, expiresIn: '30 days' | '1 hour') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: expiresIn === '30 days' ? '30d' : '1h',
  });
};

export default createToken;
