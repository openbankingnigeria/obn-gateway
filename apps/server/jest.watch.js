module.exports = {
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    'jest-watch-select-projects',
    'jest-watch-suspend',
  ],
  projects: [
    '<rootDir>/jest.config.js',
    '<rootDir>/jest.integration.config.js',
    '<rootDir>/jest.e2e.config.js',
  ],
};