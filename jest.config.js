module.exports = {
  transform: {
    '.(ts|tsx)': ['ts-jest', { diagnostics: false }],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],

  testMatch: ['<rootDir>/packages/**/src/**/*.spec.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '<rootDir>/dist/',
  ],

  verbose: true,
};
