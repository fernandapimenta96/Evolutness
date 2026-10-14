'use strict';

const js = require('@eslint/js');

// Globais do navegador usadas pelos scripts do site.
const navegador = {
  window: 'readonly',
  document: 'readonly',
  localStorage: 'readonly',
  history: 'readonly',
  matchMedia: 'readonly',
  fetch: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  AbortController: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
};

const node = {
  require: 'readonly',
  module: 'writable',
  __dirname: 'readonly',
  console: 'readonly',
};

module.exports = [
  { ignores: ['node_modules/', 'assets/', '.playwright-mcp/'] },
  js.configs.recommended,
  {
    // Scripts do site: carregados por <script src>, sem módulos.
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: navegador },
    rules: {
      // O código ignora erros de localStorage/JSON de propósito: `catch (e) { /* ... */ }`.
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // script.js também é carregado pelo Node nos testes (veja o final do arquivo).
    files: ['script.js'],
    languageOptions: { globals: { ...navegador, module: 'writable' } },
  },
  {
    files: ['eslint.config.js', 'test/**/*.js'],
    languageOptions: { sourceType: 'commonjs', globals: node },
  },
];
