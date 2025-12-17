import { z } from 'zod';

const usernameValidator = z
    .string({error: 'Username must be a string'})
    .trim()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username must contain only letters and numbers')
    .transform((val) => val.toLowerCase());

export default usernameValidator;