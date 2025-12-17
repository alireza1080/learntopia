import { PrismaClient } from '../generated/prisma/client.ts';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to MongoDB 🚀🚀🚀');
  } catch (error) {
    console.error('Error connecting to MongoDB 🚨🚨🚨', error);
    process.exit(1);
  }
};

export { prisma };
export default connectDB;
