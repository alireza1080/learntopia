import { z } from 'zod';

const descriptionValidator = (
  fieldName: string,
  maxLength: number,
  minLength: number
) =>
  z
    .string({ error: `${fieldName} must be a string` })
    .trim()
    .min(1, `${fieldName} is required`)
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`);

export default descriptionValidator;
