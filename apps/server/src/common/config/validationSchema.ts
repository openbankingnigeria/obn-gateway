import * as Joi from 'joi';

export const validationSchema = Joi.object({
  SERVER_PORT: Joi.string().optional(),
  NODE_ENV: Joi.string().optional(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_TYPE: Joi.string().optional(),
  DATABASE_PORT: Joi.string().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_EXPIRES: Joi.string().optional(),
  JWT_SECRET: Joi.string().required(),
});
