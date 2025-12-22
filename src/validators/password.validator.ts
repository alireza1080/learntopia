import { z } from 'zod';

const passwordValidator = (passwordName: string = 'Password') => z
  .string({ error: `${passwordName} must be a string` })
  .trim()
  .min(1, `${passwordName} is required`)
  .min(8, `${passwordName} must be at least 8 characters`)
  .max(32, `${passwordName} must be less than 32 characters`)
  .regex(/[A-Z]/, `${passwordName} must contain at least one uppercase letter`)
  .regex(/[a-z]/, `${passwordName} must contain at least one lowercase letter`)
  .regex(/[0-9]/, `${passwordName} must contain at least one number`)
  .regex(
    /[@$!%*?&]/,
    `${passwordName} must contain at least one special character (@, $, !, %, *, ?, or &)`
  );

export default passwordValidator;
