import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { collectEntryFiles } from './entrySizes.mjs'
import { componentEntries, dependencyClosure, inspectEntry } from './entryIsolation.mjs'
import { readDeclaredDependencies } from './declaredDependencies.mjs'

/**
 * Гейт изоляции гранулярного импорта. Запускается по `dist`, после сборки.
 *
 * Отчёт о весе (`report-entry-sizes.mjs`) гейтом сделан не был осознанно: порог
 * с потолка краснеет на честном росте компонента. Здесь порога нет — есть
 * булево свойство, ради которого пакет и существует: взяв
 * `@feugene/granularity/components/GrX`, потребитель получает `GrX` и его
 * объявленные зависимости, и ничью больше разметку. Такое либо выполняется,
 * либо нет, и обсуждать тут нечего.
 *
 * Разбор того, что считается утечкой и почему, — в `entryIsolation.mjs`.
 */
const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'))

if (!existsSync(resolve(packageDir, 'dist'))) {
  console.error('[entry-isolation] нет `dist` — гейт читает собранный пакет, сначала `yarn build`')
  process.exit(2)
}

const entries = componentEntries(manifest.exports ?? {}, packageDir)

if (entries.length === 0) {
  console.error('[entry-isolation] в `exports` нет ни одной entry компонента — проверять нечего')
  process.exit(2)
}

const declaredOf = component => readDeclaredDependencies(resolve(packageDir, 'src/components'), component)

const leaks = []
const blind = []

for (const entry of entries) {
  const { reached, blind: opaque } = inspectEntry(collectEntryFiles(entry.file))
  const allowed = dependencyClosure(entry.owner, declaredOf)
  allowed.add(entry.owner)

  const extra = reached.filter(component => !allowed.has(component))

  if (extra.length > 0)
    leaks.push({ owner: entry.owner, extra, allowed: [...allowed].filter(name => name !== entry.owner).sort() })

  for (const file of opaque)
    blind.push(`${entry.owner}: ${relative(packageDir, file)}`)
}

if (blind.length > 0) {
  console.error(
    `[entry-isolation] ${blind.length} файлов гейт прочитать не смог: карты нет, а свой код есть.\n`
    + `${[...new Set(blind)].map(line => `  ${line}`).join('\n')}\n`
    + 'Атрибуция идёт по `sources` сорсмапа — без карты утечка в этом файле не видна,\n'
    + 'и зелёный гейт означал бы только то, что он ослеп. Проверь `sourcemap` в `vite.config.ts`.',
  )
  process.exit(1)
}

if (leaks.length > 0) {
  const list = leaks
    .map(({ owner, extra, allowed }) => `  ${owner} ← ${extra.join(', ')}`
      + `\n      объявлено (с транзитивными): ${allowed.join(', ') || '—'}`)
    .join('\n')

  console.error(
    `[entry-isolation] ${leaks.length} entry из ${entries.length} тянут чужую разметку:\n${list}\n\n`
    + 'Потребитель, взявший подпуть, получает вместе с ним вёрстку и классы компонента,\n'
    + 'которого не просил. Либо зависимость реальна — тогда её объявляет `config.dependencies`,\n'
    + 'либо общий импорт сводит два компонента в один чанк, и разводить нужно импорт.',
  )
  process.exit(1)
}

console.log(`[entry-isolation] OK — ${entries.length} entry, чужой разметки ни в одной.`)
