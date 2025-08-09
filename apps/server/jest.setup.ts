import 'jest-extended/all';
import { DataSource } from 'typeorm';
import ormConfig from './ormconfig.testing';
import { getTestDbConfig } from '../server/src/test-utils/config/test-db-config';
import 'jest-chain';

declare global {
  namespace jest {
    interface Matchers<R extends void | Promise<void>, T = {}> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toBeValidUUID(): R;
      toBeValidDate(): R;
      toBeValidEmail(): R;
      toBeValidPhoneNumber(): R;
      toBeValidUrl(): R;
    }
  }
}

let testDataSource: DataSource;

beforeAll(async () => {
  try {
    if (process.env.USE_REAL_DB === 'true') {
      testDataSource = new DataSource(getTestDbConfig());
      await testDataSource.initialize();
      await testDataSource.runMigrations();
    }
  } catch (error) {
    console.error('Test DB initialization failed:', error);
    throw error;
  }
});

afterAll(async () => {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
});

beforeEach(async () => {
  jest.clearAllMocks();
  
  if (testDataSource) {
    const queryRunner = testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    (global as any).__TEST_QUERY_RUNNER__ = queryRunner;
  }
});

afterEach(async () => {
  const queryRunner = (global as any).__TEST_QUERY_RUNNER__;
  if (queryRunner) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }
});

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },

  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`,
      pass,
    };
  },

  toBeValidDate(received: Date | string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid date`,
      pass,
    };
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
      pass,
    };
  },
});


const initializeDatabase = async () => {
  try {
    testDataSource = new DataSource(ormConfig);
    await testDataSource.initialize();
    
    // Run migrations if needed
    await testDataSource.runMigrations();
    console.log('✅ Test database initialized');
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