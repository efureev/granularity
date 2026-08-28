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
    ],
    vue: false,
    typescript: {
      tsconfigPath,
    },
    jsonc: false,
    yaml: false,
    unocss: false,
    stylistic: true,
  },
  {
    rules: {
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-exports': 'off',

      'import/first': 'off',
      'import/consistent-type-specifier-style': 'off',

      'test/prefer-lowercase-title': 'off',
      'node/prefer-global/process': 'off',

      'ts/consistent-type-definitions': 'off',
      'ts/strict-boolean-expressions': 'off',

      'no-console': 'off',

      // `break` — часть синтаксиса `case`, а не второй оператор строки:
      // таблица `case 'x': doIt(); break` читается строкой на вариант.
      'style/max-statements-per-line': ['error', { max: 1, ignoredNodes: ['BreakStatement'] }],

      'unused-imports/no-unused-imports': 'warn',
    },
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    // Примеры в README — не программа: `eslint --fix` вычищает из них импорты
    // как неиспользуемые переменные и оставляет пустые блоки кода. Override
    // обязан идти последним: в плоском конфиге выигрывает поздний.
    files: ['**/*.md', '**/*.md/**'],
    rules: {
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'ts/no-unused-vars': 'off',
    },
  },
)
