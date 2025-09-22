/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/test/utils/config/jest-environment.ts',

  setupFiles: [
    'tsconfig-paths/register',
    '<rootDir>/test/jest.polyfills.js',
    '<rootDir>/test/jest.mocks.js',
  ],

  setupFilesAfterEnv: [
    '<rootDir>/test/jest.setup.ts',
    '<rootDir>/test/utils/config/test-setup.ts',
    // '<rootDir>/test/utils/config/unit-test-setup.ts',
    'jest-extended/all',
  ],

  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    '^@elastic/elasticsearch$': '<rootDir>/node_modules/@elastic/elasticsearch',
    '^@nestjs/elasticsearch$': '<rootDir>/node_modules/@nestjs/elasticsearch',
    '^sqlite3$': require.resolve('sqlite3'),
  },

  modulePaths: ['<rootDir>'],

  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: {
          warnOnly: process.env.CI !== 'true',
        },
        astTransformers: {
          before: [
            {
              path: require.resolve('ts-jest-mock-import-meta'),
              options: {
                metaObjectReplacement: { url: 'https://www.url.com' },
              },
            },
          ],
        },
      },
    ],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globalSetup: '<rootDir>/test/utils/config/global-setup.ts',
  globalTeardown: '<rootDir>/test/utils/config/global-teardown.ts',
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/e2e/',
    '/coverage/',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.service.ts',
    'src/**/*.controller.ts',
    'src/**/*.guard.ts',
    'src/**/*.interceptor.ts',
    'src/**/*.pipe.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/**/*.mock.ts',
    '!src/**/*.guard.ts',
    '!src/**/*.pipe.ts',
  ],
  coveragePathIgnorePatterns: [
    '/src/setup.ts',
    '/src/.*\\.config.ts',
    '/src/common/config/',
    '/src/.*\\.(d|interface|type|schema|constants|entity|dto|model)\\.ts',
    '/src/main.ts',
    '/src/app.module.ts',
    '/src/shared/integrations/',
    '/src/shared/email/',
    '/src/shared/events/base.event.ts',
    '/src/shared/events/all.event.ts',
    '/src/common/utils/exceptions/exception.(filter|handler).ts',
    '.*\\.spec.ts$',
    '.*\\.test.ts$',
    '/src/common/utils/pipes/',
    '/src/common/utils/authentication/.*\\.guard.ts',
  ],
  coverageDirectory: 'test/coverage',
  coverageReporters: ['text', 'html', 'lcov', 'text-summary', 'clover'],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test/test-results',
        outputName: 'junit.xml',
        includeConsoleOutput: true,
      },
    ],
    [
      'jest-html-reporter',
      {
        outputPath: 'test/test-results/test-report.html',
        pageTitle: 'Test Report',
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
  maxWorkers: process.env.CI ? '50%' : '80%',
  workerIdleMemoryLimit: '512MB',
  cacheDirectory: '<rootDir>/test/.jest-cache',
  silent: false,
  verbose: true,
  bail: false,
  testTimeout: 30000,
  slowTestThreshold: 5000,
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resolver: 'jest-ts-webcompat-resolver',
};
