import { fileURLToPath } from 'node:url'

import antfu from '@antfu/eslint-config'
import globals from 'globals'

/**
 * Путь до `tsconfig.json` — абсолютный, а не относительный.
 *
 * Типизированные правила резолвят его от **cwd**, а не от этого файла. Из
 * директории витрины всё сходится, но редактор запускает ESLint из корня
 * монорепо — и там `tsconfig.json` другой (точнее, его нет вовсе). Гейт при
 * этом оставался бы зелёным, потому что `yarn lint` идёт из витрины, —
 * расходились ровно IDE и CI.
 */
const tsconfigPath = fileURLToPath(new URL('./tsconfig.json', import.meta.url))

export default antfu(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'e2e/__screenshots__/**',
      'uno.config.ts',
      // Собираются `generate:api` и `generate:search`; правка руками теряется
      // на следующем прогоне — см. `.claude/rules/showcase-conventions.md`.
      'src/content/generated/**',
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
    stylistic: true,
  },
  {
    // Набор совпадает с пакетом библиотеки: витрина и пакет пишутся одними
    // руками, и разъехавшиеся правила означали бы два разных стиля в одном
    // репозитории.
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

      // `break` — часть синтаксиса `case`, а не второй оператор строки:
      // таблица `case 'x': doIt(); break` читается строкой на вариант.
      'style/max-statements-per-line': ['error', { max: 1, ignoredNodes: ['BreakStatement'] }],

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
  {
    /**
     * Страницы доков хранят примеры кода строками.
     *
     * `${…}` внутри них — часть показываемого сниппета, а не забытые обратные
     * кавычки в нашем коде: правило `no-template-curly-in-string` ловит ровно
     * ту опечатку, которой здесь быть не может.
     */
    files: ['src/content/**/*.ts'],
    rules: {
      'no-template-curly-in-string': 'off',
    },
  },
  {
    /**
     * Демо — это ещё и сниппет: под превью показывается исходник того же файла,
     * который его отрисовал. Читатель копирует его к себе целиком, поэтому
     * правила здесь про читаемость чужого кода, а не про наш стиль.
     */
    files: ['src/demos/**/*.vue'],
    rules: {
      // Ключи вида `['components.GrButton']` в демо не встречаются, а вот
      // однострочные шаблоны — сплошь: демо тем и ценно, что короткое.
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
    },
  },
)
