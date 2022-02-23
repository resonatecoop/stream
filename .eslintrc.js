module.exports = {
  extends: [
    'standard-with-typescript'
  ],
  ignorePatterns: ['**/dist/**', '**/build/**'],
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    project: './tsconfig.json'
  },
  overrides: [{
    files: ['*.ts', '*.tsx'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', {
        allowNumber: true,
        allowBoolean: false,
        allowAny: true,
        allowNullish: true,
        allowRegExp: false
      }],
      '@typescript-eslint/strict-boolean-expressions': ['error', {
        allowString: true,
        allowNumber: true,
        allowNullableObject: true,
        allowNullableBoolean: true,
        allowNullableString: true,
        allowNullableNumber: true,
        allowAny: true
      }]
    }
  }]
}
