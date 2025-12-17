import app from './app.ts';
import connectDB, { prisma } from './services/db.service.ts';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  await connectDB();

  console.log(`Server is running on port ${PORT}`);
});
