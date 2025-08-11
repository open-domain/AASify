import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Base ESLint rules for JavaScript
  js.configs.recommended,
  
  // TypeScript ESLint configuration
  {
    files: ['**/*.ts', '**/*.js'], // Target all TypeScript files
    languageOptions: {
        parser: tsparser, // Use TypeScript parser
        parserOptions: {
            project: './tsconfig.json',
            ecmaVersion: 'latest',
            sourceType: 'module',
        }
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
    //   '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    //   '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'warn', // Allow console statements but warn
      'no-undef': 'off',     // Disable no-undef for Node.js globals
      'no-unused-vars' : 'off'
    }
  },
];
