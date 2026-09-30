// Architecture rules live here so they're enforced, not just documented (see apps/mobile/CLAUDE.md).
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

const RAW_RN_PRIMITIVES = {
  name: 'react-native',
  importNames: ['View', 'Text', 'TextInput', 'TouchableOpacity', 'Image', 'Button'],
  message: 'Use Gluestack primitives (@/components/ui/*) or @/src/design-system components.',
};

const NO_DATA_IN_PRESENTATION = {
  group: ['@tanstack/react-query', '**/api', '**/queries'],
  message:
    'Presentational components get data via props. Fetch in queries.ts hooks, used by screens.',
};

const NO_RAW_API_IN_SCREENS = {
  group: ['@/src/features/*/api', '**/features/*/api'],
  message: 'Screens use hooks from features/<x>/queries.ts, never raw api functions.',
};

const NO_DOMAIN_IN_DESIGN_SYSTEM = {
  group: ['@/src/features/**', '**/features/**', '@petwatch/shared', '@/src/lib/api*'],
  message: 'The design system is domain-agnostic: no features, API or shared contract imports.',
};

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', '.expo/**', 'components/ui/**'] },
  { files: ['**/*.ts', '**/*.tsx'], rules: { '@typescript-eslint/no-explicit-any': 'error' } },
  {
    files: ['app/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [RAW_RN_PRIMITIVES], patterns: [NO_RAW_API_IN_SCREENS] },
      ],
    },
  },
  {
    files: ['src/features/**/*.tsx'],
    ignores: ['src/features/**/components/**'],
    rules: { 'no-restricted-imports': ['error', { paths: [RAW_RN_PRIMITIVES] }] },
  },
  {
    files: ['src/features/**/components/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [RAW_RN_PRIMITIVES], patterns: [NO_DATA_IN_PRESENTATION] },
      ],
    },
  },
  {
    files: ['src/design-system/**/*.{ts,tsx}'],
    ignores: ['**/*.test.tsx'],
    rules: { 'no-restricted-imports': ['error', { patterns: [NO_DOMAIN_IN_DESIGN_SYSTEM] }] },
  },
  prettier,
]);
