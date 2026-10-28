import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import semver from 'semver'

/**
 * Спутник, чьи токены вида `theme` живут в темах каталога, обязан объявить
 * нижние границы тех механизмов, на которых эти значения доезжают до страницы.
 *
 * Токен `theme` читается без запасного значения. Значение ему даёт тема, тему
 * в лист превращает granum, а каталог тем приносит ядро — через пакет токенов.
 * Широкая peer-граница здесь — обещание, которого пакет не держит: на ядре 2
 * значений у темы нет, granum без разделов компонентов их не соберёт, и
 * компоненты останутся без цвета. Peer на пакет токенов прикрывает это лишь
 * отчасти — его собственной границей на granum, а разделу группы нужно больше.
 * Матрица совместимости портала читает именно эти границы.
 *
 * Пороги — механизмы, а не версии выпуска:
 * - ядро 3.1 — каталог тем из пакета токенов;
 * - granum 3.10 — значения компонентов у темы;
 * - granum 3.11 — раздел темы для группы компонентов (`group`).
 */
const repoDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CORE = '@feugene/granularity'
const GRANUM = '@feugene/granum'
const TOKENS = '@feugene/granularity-tokens'

const FLOOR_CORE = '3.1.0'
const FLOOR_GRANUM = '3.10.0'
const FLOOR_GRANUM_GROUP = '3.11.0'

function filesNamed(dir, name, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__tests__') continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) filesNamed(full, name, out)
    else if (entry.name === name) out.push(full)
  }
  return out
}

function hasThemeTokens(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'))
  return Object.values(data.tokens ?? data).some(token => token?.kind === 'theme')
}

function groupsOf(srcDir) {
  const groups = new Set()
  for (const path of filesNamed(srcDir, 'config.ts')) {
    for (const match of readFileSync(path, 'utf8').matchAll(/\bgroup:\s*'([^']+)'/g))
      groups.add(match[1])
  }
  return groups
}

const problems = []
let checked = 0

for (const name of readdirSync(join(repoDir, 'packages'))) {
  const pkgDir = join(repoDir, 'packages', name)
  const manifestPath = join(pkgDir, 'package.json')
  const srcDir = join(pkgDir, 'src')
  if (!existsSync(manifestPath) || !existsSync(srcDir)) continue

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const peers = manifest.peerDependencies ?? {}
  if (manifest.private || !peers[CORE]) continue

  const themeFiles = filesNamed(srcDir, 'tokens.json').filter(hasThemeTokens)
  if (themeFiles.length === 0) continue
  checked++

  const groups = groupsOf(srcDir)
  const groupSection = themeFiles.some(path => groups.has(basename(dirname(path))))

  const required = [
    [CORE, FLOOR_CORE],
    [GRANUM, groupSection ? FLOOR_GRANUM_GROUP : FLOOR_GRANUM],
  ]

  for (const [dependency, floor] of required) {
    const range = peers[dependency]
    const min = range && semver.minVersion(range)
    if (!min) {
      problems.push(`${manifest.name}: peer ${dependency} не объявлен`)
      continue
    }
    if (semver.lt(min, floor))
      problems.push(`${manifest.name}: peer ${dependency}@${range} — нижняя граница ниже ${floor}${dependency === GRANUM && groupSection ? ' (раздел группы)' : ''}`)
  }

  if (!peers[TOKENS])
    problems.push(`${manifest.name}: peer ${TOKENS} не объявлен — значения токенов вида theme лежат в его темах`)
}

if (problems.length > 0) {
  console.error(
    `[theme-peers] ${problems.length} — спутник со значениями у темы обещает больше, чем работает:\n`
    + `${problems.map(line => `  ${line}`).join('\n')}\n`
    + 'На версиях ниже порога значения у темы не доезжают, и компоненты остаются без цвета.',
  )
  process.exitCode = 1
}
else {
  console.log(`[theme-peers] OK — ${checked} спутников со значениями у темы объявляют ядро >=${FLOOR_CORE} и granum >=${FLOOR_GRANUM}.`)
}
