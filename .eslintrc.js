module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    '@meteorjs/eslint-config-meteor',
    'plugin:vue/vue3-essential'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'import',
    'meteor',
    'vue'
  ],
  ignorePatterns: ['quasar.js'],
  rules: {
    curly: ['error', 'all'],
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'no-restricted-exports': ['error', {
      restrictDefaultExports: {
        named: false
      }
    }],
    'object-curly-newline': ['error', {
      multiline: true,
      minProperties: 8,
      consistent: true
    }],
    'max-len': ['error', { code: 110 }],
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'vue/no-dupe-keys': 'off',
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['filters', 'options', 'result'] }
    ]
  }
}
