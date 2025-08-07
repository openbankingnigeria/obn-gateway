import 'jest-extended/all';
import { DataSource } from 'typeorm';
import ormConfig from './ormconfig.testing';
import 'jest-chain';

// Type extensions for custom matchers
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

// Custom matchers
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

let testDataSource: DataSource;

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

// Test lifecycle hooks
beforeAll(async () => {
  try {
    testDataSource = new DataSource(ormConfig);
    await testDataSource.initialize();
  } catch (error) {
    console.error('Test DB initialization failed - using mock');
    jest.mock('typeorm', () => ({
      DataSource: jest.fn(() => ({
        initialize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      }))
    }));
  }
});

afterAll(async () => {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
});

beforeEach(async () => {
  jest.clearAllMocks();
  
  // Start transaction for each test
  if (testDataSource) {
    const queryRunner = testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    // Attach queryRunner to test context
    (global as any).__TEST_QUERY_RUNNER__ = queryRunner;
  }
});

afterEach(async () => {
  // Rollback transaction after each test
  const queryRunner = (global as any).__TEST_QUERY_RUNNER__;
  if (queryRunner) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    (global as any).__TEST_QUERY_RUNNER__ = undefined;
  }
});