module.exports = {
  extends: [
    'standard-with-typescript'
  ],
  ignorePatterns: ['**/dist/**'],
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
