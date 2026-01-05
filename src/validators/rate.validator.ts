import { z } from 'zod';

const rateValidator = (fieldName: string) =>
  z
    .number({ error: `${fieldName} must be a number` })
    .int('Rate must be an integer')
    .min(1, `${fieldName} cannot be less than 1`)
    .max(5, `${fieldName} cannot be greater than 5`)
    .transform((val) => Math.round(val));

export default rateValidator;
