import { fileURLToPath } from 'node:url'

import antfu from '@antfu/eslint-config'
import globals from 'globals'

/**
 * Путь до `tsconfig.json` — абсолютный, а не относительный.
 *
 * Типизированные правила резолвят его от **cwd**, а не от этого файла. Из
 * директории пакета всё сходится, но редактор запускает ESLint из корня
 * монорепо — и там `tsconfig.json` другой (точнее, его нет вовсе): каждый файл
 * пакета падал с `Parsing error: Could not read Project Service default
 * project`. Гейт при этом оставался зелёным, потому что `yarn lint` идёт из
 * пакета, — расходились ровно IDE и CI.
 */
const tsconfigPath = fileURLToPath(new URL('./tsconfig.json', import.meta.url))

export default antfu(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'uno.config.ts',
      // Сгенерирован `yarn generate:tokens` — правится только генератор.
      'src/tokens/generated.ts',
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
    stylistic: false,
  },
  {
    rules: {
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-exports': 'off',

      'import/first': 'off',

      'test/prefer-lowercase-title': 'off',
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
      'regexp/prefer-w': 'off',
      'regexp/use-ignore-case': 'off',

      'no-console': 'off',

      'unused-imports/no-unused-imports': 'warn',

      'unocss/order': 'off',
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