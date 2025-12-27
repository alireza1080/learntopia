import { z } from 'zod';

const priceValidator = (fieldName: string, maxPrice: number) =>
  z
    .number({ error: `${fieldName} must be a number` })
    .min(0, `${fieldName} cannot be a negative number`)
    .max(maxPrice, `${fieldName} cannot be greater than ${maxPrice}`);

export default priceValidator;
