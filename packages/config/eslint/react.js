/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./base.js'],
  env: {
    browser: true,
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
