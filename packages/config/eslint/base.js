/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: ['dist', 'build', '.next', '.turbo', 'node_modules', 'coverage'],
};
