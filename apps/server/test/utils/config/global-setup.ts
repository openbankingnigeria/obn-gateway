import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import { getTestDbConfig } from './test-db-config';

export default async () => {
  console.log('Global Test Setup Started');
  
  const dbConfig = getTestDbConfig();
  console.log('Connecting with config:', {
    ...dbConfig,
    password: 'password' in dbConfig ? '*****' : undefined,
  });

  try {
    const dataSource = new DataSource(dbConfig);
    await dataSource.initialize();
    (global as any).__TEST_DB_CONNECTION__ = dataSource;
    console.log('Test Database Connected');
  } catch (error) {
    console.error('Database Connection Failed:', error);
    throw error;
  }
};