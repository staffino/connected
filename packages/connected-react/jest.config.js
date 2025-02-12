module.exports = {
  ...require('../../jest.config'),
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.spec.tsx'],
  automock: false,
};
