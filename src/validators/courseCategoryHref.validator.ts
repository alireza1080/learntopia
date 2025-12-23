import { z } from 'zod';

const courseCategoryHrefValidator = (fieldName: string) =>
  z
    .string({ error: `${fieldName} must be a string` })
    .trim()
    .min(1, `${fieldName} is required`)
    .max(50, `${fieldName} must be less than 50 characters`)
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      `${fieldName} must contain only letters and numbers and spaces`
    )
    .transform((val) =>
      val
        .trim()
        .split(/\s+/)
        .map((word) => word.toLowerCase())
        .join('-')
    );

export default courseCategoryHrefValidator;