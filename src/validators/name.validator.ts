import { z } from 'zod';

const nameValidator = z
  .string({ error: 'Name must be a string' })
  .trim()
  .min(1, 'Name is required')
  .min(3, 'Name must be at least 3 characters')
  .max(40, 'Name must be less than 40 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters')
  .transform((val) =>
    val
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  );

export default nameValidator;
