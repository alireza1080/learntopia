import { z } from 'zod';

const rateValidator = (fieldName: string, min: number = 1, max: number = 5) =>
  z
    .number({ error: `${fieldName} must be a number` })
    .int('Rate must be an integer')
    .min(min, `${fieldName} cannot be less than ${min}`)
    .max(max, `${fieldName} cannot be greater than ${max}`)
    .transform((val) => Math.round(val));

export default rateValidator;
