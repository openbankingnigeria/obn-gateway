import path from 'path';
import { DataSourceOptions } from 'typeorm';

const getEnv = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

export const getTestDbConfig = (): DataSourceOptions => {
  return {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    dropSchema: true,
    logging: true,
    entities: [
      path.join(__dirname, '../../../../src/**/*.entity{.ts,.js}'),
      path.join(__dirname, '../../../../src/**/*.view-entity{.ts,.js}'),
    ],
    migrations: [path.join(__dirname, '../../../../src/migrations/*{.ts,.js}')],
    migrationsRun: false,
  };
};