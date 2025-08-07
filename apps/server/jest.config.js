require('dotenv').config({ path: '.env.test' });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@auditLogs/(.*)$': '<rootDir>/src/auditLogs/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@permissions/(.*)$': '<rootDir>/src/permissions/$1',
    '^@profile/(.*)$': '<rootDir>/src/profile/$1',
    '^@roles/(.*)$': '<rootDir>/src/roles/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@users/(.*)$': '<rootDir>/src/users/$1',
    '^@company/(.*)$': '<rootDir>/src/company/$1',
    '^@settings/(.*)$': '<rootDir>/src/settings/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@elastic/elasticsearch$': '<rootDir>/node_modules/@elastic/elasticsearch',
    '^@nestjs/elasticsearch$': '<rootDir>/node_modules/@nestjs/elasticsearch',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^src/settings/settings.errors$': '<rootDir>/src/settings/settings.errors.ts',
    '^src/apis/types$': '<rootDir>/src/apis/types.ts',
    '^src/apis/dto/index.dto$': '<rootDir>/src/apis/dto/index.dto.ts',
    '^src/settings/types$': '<rootDir>/src/settings/types.ts'
    },

  resolver: 'jest-ts-webcompat-resolver',
  
  setupFiles: [
    '<rootDir>/jest.polyfills.js',
    '<rootDir>/jest.mocks.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest.polyfills.js',
    '<rootDir>/jest.setup.ts',
    'jest-extended/all',
  ],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: {
          warnOnly: process.env.CI !== 'true',
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/*.test.ts',
    '**/*.spec.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/e2e/',
    '/coverage/',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/migrations/**',
    '!src/**/seeds/**',
    '!src/**/__mocks__/**',
    '!src/**/__fixtures__/**',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts'
  ],
  coveragePathIgnorePatterns: [
    '/src/common/config/',
    '/src/common/database/migrations/',
    '/src/shared/integrations/',
    '/src/shared/protocols/',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'html',
    'lcov',
    'text-summary',
    'clover'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        includeConsoleOutput: true,
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test-results/test-report.html',
        pageTitle: 'Test Report',
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
  maxWorkers: process.env.CI ? '50%' : '80%',
  workerIdleMemoryLimit: '512MB',
  cacheDirectory: '<rootDir>/.jest-cache',
  verbose: true,
  bail: false,
  testTimeout: 15000,
  slowTestThreshold: 5000,
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  workerIdleMemoryLimit: '512MB',
  maxWorkers: 1,
  workerIdleMemoryLimit: '512MB',
  maxWorkers: '80%',
  resolver: 'jest-ts-webcompat-resolver',
  cacheDirectory: '<rootDir>/.jest-cache',
  verbose: true,
  bail: false,
  testTimeout: 30000
};