import * as Joi from 'joi';

export const validationSchema = Joi.object({
  SERVER_PORT: Joi.string().optional(),
});
