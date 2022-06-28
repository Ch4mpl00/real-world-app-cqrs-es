module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'airbnb-base'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'comma-dangle': 'off',
    'import/extensions': 'off',
    'arrow-parens': 'off',
    'arrow-body-style': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': [
      'error'
    ],
    'no-unused-vars': 'off',
    'consistent-return': 'off',
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-underscore-dangle': 'off',
    'no-await-in-loop': 'off',
    'max-len': [
      'error',
      {
        code: 150
      }
    ],
    'import/no-unresolved': [
      'error',
      {
        ignore: [
          'aws-lambda'
        ]
      }
    ],
    'no-mixed-operators': [
      'error',
      {
        allowSamePrecedence: true
      }
    ],
    'class-methods-use-this': 'off'
  },
  ignorePatterns: [
    'dist/',
    '__tests__'
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        // use <root>/path/to/folder/tsconfig.json
        project: '.',
      }
    }
  }
};
