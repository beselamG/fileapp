module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'no-unused-vars': 0,
    'no-fallthrough':0,
    'no-unreachable':0,
    'no-prototype-builtins':0,
    'no-empty':0,
    'no-func-assign':0,
    'no-sparse-arrays':0,
    'no-cond-assign':0,
    'no-useless-escape':0,
    'react/display-name':0,
    'react/no-find-dom-node':0,
    'no-undef':0,
    'no-misleading-character-class':0,
    'getter-return':0,
    'valid-typeof':0,
    'no-control-regex':0,
    'no-unsafe-finally':0,
    'react/prop-types':0,
    'linebreak-style':0,
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
};
