import * as fs from 'fs';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const globalConfig = (): {
  [k: string]: any;
  email: SMTPTransport.Options;
} => ({
  server: {
    port: parseInt(process.env.SERVER_PORT as string, 10) || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    type: process.env.DATABASE_TYPE || 'mysql',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT as string, 10) || 3306,
    username: process.env.DATABASE_USERNAME,
    password:
      (process.env.DATABASE_PASSWORD_FILE
        ? fs.readFileSync(process.env.DATABASE_PASSWORD_FILE)
        : undefined) || process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  auth: {
    jwtExpires: process.env.JWT_EXPIRES || '15m',
    jwtSecret:
      (process.env.JWT_SECRET_FILE
        ? fs.readFileSync(process.env.JWT_SECRET_FILE)
        : undefined) || process.env.JWT_SECRET,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT!),
    secure: process.env.EMAIL_SECURE === 'true',
    from: process.env.EMAIL_FROM,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  },
  kong: {
    adminUrl: process.env.KONG_ADMIN_URL,
  },
});
