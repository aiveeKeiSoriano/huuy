const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  { ignores: ['node_modules/**', 'android/**', 'ios/**', '.expo/**', '*.config.js', 'babel.config.js'] },
  ...compat.config({
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: [
      'react',
      'react-hooks',
      '@typescript-eslint',
      'react-native',
      'import',
      'react-native-a11y',
    ],
    extends: [
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-native/all',
    ],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'off',
      'import/order': ['warn', { 'newlines-between': 'always' }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-native/sort-styles': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  }),
];
