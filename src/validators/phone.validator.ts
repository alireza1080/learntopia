import { z } from 'zod';

const phoneValidator = z
  .string({ error: 'Phone number must be a string' })
  .trim()
  .min(1, 'Phone number is required')
  .regex(
    /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/,
    'Invalid phone number format'
  )
  .transform((val) => val.replace(/[^0-9]/g, '')) // Strip all non-digits
  .refine((val) => {
    // Valid if 10 digits, or 11 digits starting with '1'
    return val.length === 10 || (val.length === 11 && val.startsWith('1'));
  }, 'Phone number must be a valid US or Canadian 10-digit number')
  .transform((val) => (val.length === 11 ? val.slice(1) : val)); // Standardize to 10 digits

export default phoneValidator;
