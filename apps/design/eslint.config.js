import { fileURLToPath } from 'node:url'

import antfu from '@antfu/eslint-config'
import globals from 'globals'

// Абсолютный путь: типизированные правила резолвят `tsconfig.json` от cwd, а
// редактор запускает ESLint из корня монорепо.
const tsconfigPath = fileURLToPath(new URL('./tsconfig.json', import.meta.url))

export default antfu(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/components.d.ts',
    ],
    vue: {
      vueVersion: 3,
    },
    typescript: {
      tsconfigPath,
    },
    jsonc: false,
    yaml: false,
    unocss: false,
    markdown: false,
    stylistic: true,
  },
  {
    // Набор совпадает с витриной и пакетом.
    rules: {
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-exports': 'off',

      'import/first': 'off',
      'import/consistent-type-specifier-style': 'off',
      'node/prefer-global/process': 'off',

      'vue/block-order': 'off',
      'vue/define-macros-order': 'off',
      'vue/html-indent': 'off',
      'vue/no-useless-v-bind': 'off',
      'vue/no-template-shadow': 'off',

      'ts/no-unsafe-member-access': 'off',
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-argument': 'off',
      'ts/no-unsafe-call': 'off',
      'ts/no-unsafe-return': 'off',
      'ts/promise-function-async': 'off',
      'ts/strict-boolean-expressions': 'off',
      'ts/consistent-type-definitions': 'off',

      'e18e/prefer-spread-syntax': 'off',
      'e18e/prefer-static-regex': 'off',
      'regexp/no-super-linear-backtracking': 'off',

      'style/max-statements-per-line': ['error', { max: 1, ignoredNodes: ['BreakStatement'] }],

      'unused-imports/no-unused-imports': 'warn',
    },
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
)
