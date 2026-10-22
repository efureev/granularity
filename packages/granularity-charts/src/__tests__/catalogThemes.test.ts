import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { grThemeCatalog } from '@feugene/granularity-tokens'
import { loadTheme } from '@feugene/granularity-tokens/theme/node'
import { defineThemeGate, packageComponentTokens } from '@feugene/granularity-test-kit/gates'

/**
 * Темы каталога несут значения токенов вида `theme` этого пакета — раздел
 * `components/@feugene/granularity-charts/` каждой темы. Каждая тема обязана задать
 * их все и только их; разделы других пакетов сверяют их собственные гейты.
 */
const themesDir = join(dirname(createRequire(join(process.cwd(), 'package.json')).resolve('@feugene/granularity-tokens/package.json')), 'themes')

defineThemeGate({
  themeDirs: grThemeCatalog.map(theme => join(themesDir, theme.id)),
  targets: { '@feugene/granularity-charts': packageComponentTokens() },
  loadTheme: dir => loadTheme(dir),
  onlyTargets: true,
})
