import * as Joi from 'joi';

export const validationSchema = Joi.object({
  SERVER_PORT: Joi.string().optional(),
  NODE_ENV: Joi.string().optional(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_TYPE: Joi.string().optional(),
  DATABASE_PORT: Joi.string().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().optional(),
  DATABASE_PASSWORD_FILE: Joi.string().optional(),
  DATABASE_NAME: Joi.string().required(),
  JWT_EXPIRES: Joi.string().optional(),
  JWT_SECRET: Joi.string().optional(),
  JWT_SECRET_FILE: Joi.string().optional(),
})
  .xor('DATABASE_PASSWORD', 'DATABASE_PASSWORD_FILE')
  .xor('JWT_SECRET', 'JWT_SECRET_FILE');
