import { z } from 'zod';

const positiveNumberValidator = (fieldName: string) =>
  z
    .number({ error: `${fieldName} must be a number` })
    .min(1, `${fieldName} cannot be a negative or zero number`);

export default positiveNumberValidator;
