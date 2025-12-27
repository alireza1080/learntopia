import { z } from 'zod';

const fileTypeValidator = (
  fieldName: string,
  fileType: 'image' | 'video' | 'audio'
) =>
  z
    .string({ error: `${fieldName} must be a string` })
    .trim()
    .min(1, `${fieldName} is required`)
    .transform((val) => val.toLowerCase())
    .refine((val) => val.startsWith(`${fileType}/`), {
      message: `${fieldName} must be a valid type of ${fileType.toUpperCase()}`,
    });

export default fileTypeValidator;
