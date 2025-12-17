import { z } from 'zod';

const emailValidator = z
    .string({error: 'Email must be a string'})
    .trim()
    .min(1, 'Email is required')
    .max(50, 'Email must be less than 50 characters')
    .email('Invalid email address')
    .transform((val) => val.toLowerCase());

export default emailValidator;