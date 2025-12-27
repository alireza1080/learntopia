import { z } from 'zod';

const discountPercentageValidator = (fieldName: string) =>
  z
    .number({ error: `${fieldName} must be a number` })
    .min(0, `${fieldName} cannot be a negative number`)
    .max(100, `${fieldName} cannot be greater than 100`);

export default discountPercentageValidator;
