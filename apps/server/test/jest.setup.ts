import 'jest-extended/all';
import { DataSource } from 'typeorm';
import { getTestDbConfig } from './utils/config/test-db';
import 'jest-chain';

let testDataSource: DataSource;

beforeAll(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Test DB initialization failed:', error);
    throw error;
  }
});

afterAll(async () => {
  if (testDataSource?.isInitialized) {
    await destroyDatabase();
  }
});

const initializeDatabase = async () => {
  try {
    if (process.env.USE_REAL_DB === 'true') {
      testDataSource = new DataSource(getTestDbConfig());
      await testDataSource.initialize();
      console.log('✅ Test database initialized');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const destroyDatabase = async () => {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
    console.log('✅ Test database destroyed');
  }
};
