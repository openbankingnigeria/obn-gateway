import path from 'path';
import { DataSourceOptions } from 'typeorm';

const getEnv = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

export const getTestDbConfig = (): DataSourceOptions => {
  return {
    type: 'mysql',
    host: getEnv('MYSQL_TEST_HOST', 'localhost'),
    port: parseInt(getEnv('TEST_DATABASE_PORT', '3307'), 10),
    username: getEnv('TEST_DATABASE_USERNAME', 'test_user'),
    password: getEnv('TEST_DATABASE_PASSWORD', 'password'),
    database: getEnv('TEST_DATABASE_NAME', 'test_db'),
    synchronize: false,
    dropSchema: true,
    logging: false,
    entities: [path.join(__dirname, '../../../src/**/*.entity{.ts,.js}')],
    migrations: [
      path.join(
        __dirname,
        '../../../src/common/database/migrations/*{.ts,.js}',
      ),
    ],
    migrationsRun: true,
  };
};
