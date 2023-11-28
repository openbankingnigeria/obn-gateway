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
  EMAIL_HOST: Joi.string().domain(),
  EMAIL_PORT: Joi.number(),
  EMAIL_PASSWORD: Joi.string(),
  EMAIL_USER: Joi.string(),
  EMAIL_SECURE: Joi.boolean(),
  EMAIL_FROM: Joi.string(),
  LOGSTASH_ENDPOINT: Joi.string().required(),
})
  .xor('DATABASE_PASSWORD', 'DATABASE_PASSWORD_FILE')
  .xor('JWT_SECRET', 'JWT_SECRET_FILE');
