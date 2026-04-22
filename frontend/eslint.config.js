import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  // Base JS recommended rules
  js.configs.recommended,

  // React files
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React core
      ...reactPlugin.configs.recommended.rules,

      // React hooks
      ...reactHooksPlugin.configs.recommended.rules,

      // Don't require React in scope (React 17+ JSX transform)
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // General
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },

  // Ignore build output
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
