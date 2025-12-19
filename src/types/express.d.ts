// src/types/express.d.ts

import { Express } from 'express';
import { prisma } from 'services/db.service.ts';

type User = Awaited<ReturnType<typeof prisma.user.findUnique>>;

declare global {
  namespace Express {
    interface Request {
      token?: {
        userId: string;
      } | null;
      user?: User | null;
      roleLevel?: 0 | 1 | 2 | 3;
    }
  }
}
