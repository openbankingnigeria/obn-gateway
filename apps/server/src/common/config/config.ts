import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';
import * as fs from 'fs';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { DataSourceOptions } from 'typeorm';

export const globalConfig = (): {
  [k: string]: any;
  email: SMTPTransport.Options;
  database: DataSourceOptions;
} => {
  const config: {
    [k: string]: any;
    email: SMTPTransport.Options;
    database: DataSourceOptions;
    elasticsearch: ElasticsearchModuleOptions;
  } = {
    server: {
      port: parseInt(process.env.SERVER_PORT as string, 10) || 8089,
      managementUrl: process.env.MANAGEMENT_URL,
      corsOrigins: process.env.CORS_ORIGINS,
    },
    database: {
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT as string, 10) || 3306,
      username: process.env.DATABASE_USERNAME,
      password:
        (process.env.DATABASE_PASSWORD_FILE
          ? fs.readFileSync(process.env.DATABASE_PASSWORD_FILE).toString()
          : '') || process.env.DATABASE_PASSWORD,
      name: process.env.DATABASE_NAME,
      logging: process.env.DATABASE_QUERY_LOGGING === 'true',
    },
    auth: {
      jwtExpires: process.env.JWT_EXPIRES || '15m',
      jwtSecret:
        (process.env.JWT_SECRET_FILE
          ? fs.readFileSync(process.env.JWT_SECRET_FILE)
          : undefined) || process.env.JWT_SECRET,
      defaultOtpExpiresMinutes: process.env.DEFAULT_OTP_EXPIRES_MINUTES || '15',
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
      endpoint: {
        development:
          process.env.KONG_ADMIN_API_ENDPOINT ||
          process.env.KONG_ADMIN_API_ENDPOINT_DEVELOPMENT,
      },
    },
    logging: {
      endpoint: process.env.LOGSTASH_ENDPOINT,
    },
    elasticsearch: {
      node: process.env.ELASTICSEARCH_ENDPOINT!,
      auth: {
        apiKey: process.env.ELASTICSEARCH_APIKEY!,
        bearer: process.env.ELASTICSEARCH_BEARER!,
        username: process.env.ELASTICSEARCH_USERNAME!,
        password: process.env.ELASTICSEARCH_PASSWORD!,
      },
    },
    uploads: {
      maxFileUploadSize:
        Number(process.env.UPLOAD_MAXIMUM_FILE_SIZE) || 2097152,
    },
  };
  for (const env in process.env) {
    if (env.startsWith('KONG_ADMIN_API_ENDPOINT_')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const environment = env
        .split('KONG_ADMIN_API_ENDPOINT_')[1]
        .toLowerCase();
      config.kong.endpoint[environment] = process.env[env];
    }
  }
  return config;
};
