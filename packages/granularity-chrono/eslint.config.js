import antfu from '@antfu/eslint-config'
import globals from 'globals'

export default antfu(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
    ],
    vue: {
      vueVersion: 3,
    },
    typescript: {
      tsconfigPath: 'tsconfig.json',
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
      'import/consistent-type-specifier-style': 'off',

      'test/prefer-lowercase-title': 'off',
      'node/prefer-global/process': 'off',

      'vue/block-order': 'off',
      'vue/define-macros-order': 'off',
      'vue/html-indent': 'off',

      'ts/consistent-type-definitions': 'off',
      'ts/strict-boolean-expressions': 'off',

      'no-console': 'off',

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
