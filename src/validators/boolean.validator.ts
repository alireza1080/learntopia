import { z } from 'zod';

const booleanValidator = (fieldName: string) =>
  z
    .boolean({ error: `${fieldName} must be a boolean` })
    .refine((val) => val === true || val === false, {
      message: `${fieldName} must be a boolean`,
    });

export default booleanValidator;
