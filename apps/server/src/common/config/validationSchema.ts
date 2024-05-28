import * as Joi from 'joi';

export const validationSchema = Joi.object({
  SERVER_PORT: Joi.string().optional(),
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
  DEFAULT_OTP_EXPIRES_MINUTES: Joi.string().optional(),
  EMAIL_HOST: Joi.string().domain(),
  EMAIL_PORT: Joi.number(),
  DEFAULT_PASSWORD: Joi.string().optional(),
  DEFAULT_PASSWORD_FILE: Joi.string().optional(),
  EMAIL_PASSWORD: Joi.string().optional(),
  EMAIL_PASSWORD_FILE: Joi.string().optional(),
  EMAIL_USER: Joi.string(),
  EMAIL_SECURE: Joi.boolean(),
  EMAIL_FROM: Joi.string(),
  LOGSTASH_ENDPOINT: Joi.string().optional(),
  UPLOAD_MAXIMUM_FILE_SIZE: Joi.string().optional(),
  MANAGEMENT_URL: Joi.string().uri().required(),
  TRUSTED_ORIGINS: Joi.string().optional().allow(''),
  REGISTRY_INTROSPECTION_CLIENT_SECRET: Joi.string().optional(),
  REGISTRY_INTROSPECTION_CLIENT_SECRET_FILE: Joi.string().optional(),
  REGISTRY_INTROSPECTION_CLIENT_SECRET_PRODUCTION: Joi.string().optional(),
  REGISTRY_INTROSPECTION_CLIENT_SECRET_PRODUCTION_FILE: Joi.string().optional(),
})
  .xor('DATABASE_PASSWORD', 'DATABASE_PASSWORD_FILE')
  .xor('DEFAULT_PASSWORD', 'DEFAULT_PASSWORD_FILE')
  .xor('EMAIL_PASSWORD', 'EMAIL_PASSWORD_FILE')
  .xor(
    'REGISTRY_INTROSPECTION_CLIENT_SECRET',
    'REGISTRY_INTROSPECTION_CLIENT_SECRET_FILE',
  )
  .xor(
    'REGISTRY_INTROSPECTION_CLIENT_SECRET_PRODUCTION',
    'REGISTRY_INTROSPECTION_CLIENT_SECRET_PRODUCTION_FILE',
  )
  .xor('JWT_SECRET', 'JWT_SECRET_FILE');
