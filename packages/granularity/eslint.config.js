import antfu from '@antfu/eslint-config'
import globals from 'globals'

export default antfu(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'uno.config.ts',
    ],
    vue: {
      vueVersion: 3,
    },
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },
    jsonc: false,
    yaml: false,
    unocss: true,
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