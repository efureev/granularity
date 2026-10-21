import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'
import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '@feugene/granularity-tokens'

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
 * `styles/` и `tokens/` из скана исключены: их генерируют реестр и данные тем
 * пакета `@feugene/granularity-tokens`, и литералы там — это они и есть.
 *
 * Значения компонентов живут в темах пакета токенов — разделом
 * `components/@feugene/granularity/<GrX>/` исходника каждой темы; `themesDir` у
 * компонентов нет. Токен темы компонент читает без запасного значения, а хук
 * с литералом по умолчанию несёт причину `literal`.
 */
const themesDir = join(dirname(createRequire(join(process.cwd(), 'package.json')).resolve('@feugene/granularity-tokens/package.json')), 'themes')

defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens],
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
  themeSources: { themesDir, packageId: '@feugene/granularity' },
  themeTokenFallback: true,
  hookLiterals: true,
  themesDirAbsent: true,
  themeKindOnly: true,
})
