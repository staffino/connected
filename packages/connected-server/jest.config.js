module.exports = {
  ...require('../../jest.config'),
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  automock: false,
  setupFiles: ['./jest.setup.ts'],
};
