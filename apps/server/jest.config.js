module.exports = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/test/utils/config/jest-environment.ts',

  setupFiles: [
    'tsconfig-paths/register',
    '<rootDir>/test/jest.polyfills.js',
    '<rootDir>/test/jest.mocks.js',
  ],

  setupFilesAfterEnv: [
    '<rootDir>/test/utils/config/test-db-config.ts',
    '<rootDir>/test/jest.setup.ts',
    '<rootDir>/test/utils/config/test-setup.ts',
    'jest-extended/all'
  ],

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
    '^@utils/(.*)$': '<rootDir>/test/utils/$1',
    '^src/apis/(.*)$': '<rootDir>/src/apis/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@elastic/elasticsearch$': '<rootDir>/node_modules/@elastic/elasticsearch',
    '^@nestjs/elasticsearch$': '<rootDir>/node_modules/@nestjs/elasticsearch',
    '^sqlite3$': require.resolve('sqlite3')
  },

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
              options: { metaObjectReplacement: { url: 'https://www.url.com' } },
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
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.next/', '/e2e/', '/coverage/'],
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
    '!src/**/*.test.ts'
  ],
  coveragePathIgnorePatterns: [
    '/src/common/config/',
    '/src/common/database/migrations/',
    '/src/shared/integrations/',
    '/src/shared/protocols/',
  ],
  coverageDirectory: 'test/coverage',
  coverageReporters: ['text', 'html', 'lcov', 'text-summary', 'clover'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test/test-results', outputName: 'junit.xml', includeConsoleOutput: true }],
    ['jest-html-reporter', { outputPath: 'test/test-results/test-report.html', pageTitle: 'Test Report', includeFailureMsg: true, includeConsoleLog: true }],
  ],
  maxWorkers: process.env.CI ? '50%' : '80%',
  workerIdleMemoryLimit: '512MB',
  cacheDirectory: '<rootDir>/test/.jest-cache',
  silent: true,
  verbose: true,
  bail: false,
  testTimeout: 30000,
  slowTestThreshold: 5000,
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  resolver: 'jest-ts-webcompat-resolver',
};
