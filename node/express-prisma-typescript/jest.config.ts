/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testMatch: ['**/tests/**/(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@utils$': '<rootDir>/src/utils',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
    '^@domains$': '<rootDir>/src/domains',
    '^@app$': '<rootDir>/src/app',
    '^@router$': '<rootDir>/src/router'
  },
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  collectCoverageFrom: ['<rootDir>/src/domains/**/service/*.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/src/domains/socket/*']
}

export default config
