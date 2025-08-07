import { DataSourceOptions } from 'typeorm';
import path from 'path';
import { config } from 'dotenv';

config({ path: '.env.test' });

const ormConfig: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.TEST_DB_PATH || ':memory:',
  entities: [
    path.join(__dirname, '../src/**/*.entity{.ts,.js}'),
    path.join(__dirname, '../src/**/*.view-entity{.ts,.js}'),
  ],
  migrations: [path.join(__dirname, '../src/migrations/*{.ts,.js}')],
  synchronize: false, // Better to use migrations in tests
  dropSchema: true,
  logging: process.env.DB_LOGGING === 'true',
  migrationsRun: true,
  cache: false,
};

// Validation tests
describe('ORM Config', () => {
  it('should export valid configuration', () => {
    expect(ormConfig).toBeDefined();
    expect(ormConfig.type).toBe('sqlite');
    expect(ormConfig.entities).toBeDefined();
    expect(ormConfig.entities?.length).toBeGreaterThan(0);
  });
});

export default ormConfig;