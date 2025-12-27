import { z } from 'zod';

const durationValidator = (fieldName: string) =>
  z
    .number({ error: `${fieldName} must be a number` })
    .min(60, `${fieldName} cannot be less than 60 seconds`)
    .max(10800, `${fieldName} cannot be greater than 3 hours`);

export default durationValidator;
