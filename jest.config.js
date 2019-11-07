module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },

  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testURL: 'http://localhost',

  testMatch: ['<rootDir>/packages/**/src/**/*.spec.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '<rootDir>/dist/',
  ],

  verbose: true,
};
