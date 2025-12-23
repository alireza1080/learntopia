import { z } from 'zod';

const categoryNameValidator = (fieldName: string) =>
  z
    .string({ error: `${fieldName} must be a string` })
    .trim()
    .min(1, `${fieldName} is required`)
    .max(50, `${fieldName} must be less than 50 characters`)
    .regex(/^[a-zA-Z\s]+$/, `${fieldName} must contain only letters and spaces`)
    .transform((val) =>
      val
        .trim()
        .split(/\s+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ')
    );

export default categoryNameValidator;
