import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'

import { grDerivedTokens, grFoundationTokens, grThemeTokens } from '../tokens'

/**
 * Покомпонентные переменные (`--gr-tree-row-py`, `--gr-button-primary-bg`)
 * потребитель видит как публичный API темизации: он их переопределяет. Пакет же
 * до реестра не видел их вовсе — переименование не роняло ни одного теста, а
 * узнать имя можно было только из исходников. Реестр `tokens.json` рядом с
 * компонентом закрывает обе дыры: имя объявлено, и оно попадает в
 * `docs/tokens.md` вместе с природой (`kind`) и дефолтом.
 *
 * CSS из реестра не генерируется намеренно: `hook`-токены обязаны остаться
 * неприсвоенными, иначе `var(--gr-x, дефолт)` перестанет падать на дефолт.
 *
 * `styles/` и `tokens/` из скана исключены: они генерируются из `tokens/*.json`
 * и обязаны содержать литералы — это они и есть.
 */
defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grThemeTokens],
  extraRegistries: ['composables'],
  excludeTopDirs: ['styles', 'tokens'],
  // Четыре семейства названы короче своего компонента. Имя токена — публичный
  // контракт темы: приложение уже переопределяет `--gr-progress-danger-bg`, и
  // переименование ради буквальности стоило бы мажорной версии.
  ownerPrefixOverrides: {
    GrCommandPalette: '--gr-command-',
    GrDataTable: '--gr-datatable-',
    GrProgressBar: '--gr-progress-',
    GrSortableList: '--gr-sortable-',
  },
})
