import { z } from 'zod';

const roleValidator = z
  .string({ error: 'Role must be a string' })
  .trim()
  .min(1, 'Role is required')
  .transform((val) => val.toUpperCase())
  .refine((val) => ['ADMIN', 'TEACHER', 'USER'].includes(val), {
    message: 'Role must be admin, teacher, or user',
  });

export default roleValidator;
