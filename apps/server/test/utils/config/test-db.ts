import { DataSourceOptions } from 'typeorm';

const getEnv = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

export const getTestDbConfig = (): DataSourceOptions => {
  return {
    type: 'mysql',
    host: getEnv('MYSQL_TEST_HOST', 'localhost'),
    port: parseInt(getEnv('TEST_DATABASE_PORT', '3306'), 10),
    username: getEnv('TEST_DATABASE_USERNAME', 'root'),
    password: getEnv('TEST_DATABASE_PASSWORD', 'Password123@'),
    database: getEnv('TEST_DATABASE_NAME', 'test_db'),
    synchronize: false,
    dropSchema: false,
    logging: false,
  };
};
