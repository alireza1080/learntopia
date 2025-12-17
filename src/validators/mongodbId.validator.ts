import { z } from 'zod';

const mongodbIdValidator = z
  .string('id is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID');

export default mongodbIdValidator;