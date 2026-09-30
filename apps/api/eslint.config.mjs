// @ts-check
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'src/generated/**',
      'coverage/**',
      'eslint.config.mjs',
      'prisma.config.ts',
    ],
  },
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // NOTE: no `consistent-type-imports` here. Nest DI reads constructor param types via
      // emitDecoratorMetadata; turning `import { X }` into `import type { X }` erases X and breaks DI.
    },
  },
  {
    // Layering: controller → service → Prisma. Controllers never touch the database.
    files: ['src/**/*.controller.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/prisma/**', '**/generated/prisma/**'],
              message: 'Controllers call services; only services talk to Prisma.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.spec.ts'],
    rules: { '@typescript-eslint/unbound-method': 'off' },
  },
  prettier,
]);
