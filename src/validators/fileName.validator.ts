import { transform, z } from 'zod';

const fileNameValidator = (fieldName: string) =>
  z
    .string({ error: `${fieldName} must be a string` })
    .trim()
    .min(1, `${fieldName} is required`)
    .max(255, `${fieldName} must be less than 255 characters`)
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      `${fieldName} must contain only letters and numbers and spaces`
    )
    .transform((val) => val.toLowerCase())
    //! Remove all special characters
    .transform((val) => val.replace(/[^a-zA-Z0-9\s]/g, ''))
    //! Replace all spaces with hyphens
    .transform((val) => val.replace(/\s+/g, '-'))
    //! Remove all consecutive hyphens
    .transform((val) => val.replace(/-+/g, '-'));

export default fileNameValidator;
