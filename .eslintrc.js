// eslint-disable-next-line functional/immutable-data,functional/no-expression-statement
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard',
    'plugin:functional/recommended',
    'plugin:functional/external-recommended',
    'plugin:functional/stylitic'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'functional'
  ],
  rules: {
    'functional/no-conditional-statement': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-redeclare': 'off',
    'functional/functional-parameters': 'off',
    'functional/no-return-void': 'off',
    'functional/no-expression-statement': 'off'
  }
}
