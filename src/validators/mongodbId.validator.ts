import { z } from 'zod';

const mongodbIdValidator = (fieldName: string) =>
  z
    .string({ error: `${fieldName} must be a string` })
    .trim()
    .min(1, `${fieldName} is required`)
    .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} is invalid`);

export default mongodbIdValidator;
