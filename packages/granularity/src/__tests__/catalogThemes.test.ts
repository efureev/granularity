import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { defineThemeGate } from '@feugene/granularity-test-kit/gates'
import { grThemeCatalog } from '@feugene/granularity-tokens'
import { loadTheme } from '@feugene/granularity-tokens/theme/node'

import { grComponentTokens } from '../tokens'

/**
 * Темы каталога — то же, что пакет темы для ядра: каждая выходит связкой с ним
 * и обязана задать каждый токен вида `theme` каждого компонента, а задавать
 * только их; разделы спутников сверяют их собственные гейты. Тема собирается
 * из исходника сборкой дизайн-системы — полнота глобальных токенов, контраст, ΔE.
 */
const themesDir = join(dirname(createRequire(join(process.cwd(), 'package.json')).resolve('@feugene/granularity-tokens/package.json')), 'themes')

defineThemeGate({
  themeDirs: grThemeCatalog.map(theme => join(themesDir, theme.id)),
  targets: { '@feugene/granularity': grComponentTokens },
  loadTheme: dir => loadTheme(dir),
  onlyTargets: true,
})
