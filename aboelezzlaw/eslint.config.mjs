import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

/**
 * `next lint` انتهى عمره ويُحذف في Next 16، فنشغّل ESLint مباشرة.
 * `eslint-config-next` ما زال بصيغة eslintrc، فنُحوّله بـ FlatCompat.
 */
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'private/downloads/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // الفحص الفعلي للأنواع يجريه tsc؛ هذه القاعدة تمنع `any` العابر
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // سكربتات البناء والاختبار تعمل في Node لا في المتصفّح
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'tests/**/*.mts'],
    rules: { 'no-console': 'off' },
  },
];

export default config;
