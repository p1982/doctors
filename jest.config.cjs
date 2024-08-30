// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   moduleNameMapper: {
//     '^@/(.*)$': '<rootDir>/src/$1',
//   },
//   transform: {
//     '^.+\\.ts?$': 'ts-jest',
//   },
//   testMatch: ['**/tests/**/*.test.ts'],
//   moduleFileExtensions: ['ts', 'js', 'json', 'node'],
// };
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true, // Включить сбор покрытия
  collectCoverageFrom: ['src/**/*.ts'], // Указать файлы, для которых нужно собирать покрытие
  coverageDirectory: 'coverage', // Указать директорию для хранения отчета о покрытии
};
