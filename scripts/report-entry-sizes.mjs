import { appendFileSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { entriesFromExports, formatKb, formatReport, measureEntries } from './entrySizes.mjs'

/**
 * Отчёт о весе гранулярных импортов. Запускается после сборки — по `dist`.
 *
 * Гейта здесь нет намеренно: порог, взятый с потолка, начнёт краснеть на
 * честном росте компонента, и его научатся поднимать не глядя. Задача отчёта —
 * сделать вес видимым в сводке прогона, чтобы скачок заметили в ревью. Булево
 * свойство, которое обсуждать не о чем, закрывает соседний гейт изоляции.
 *
 * Скрипт живёт в корне и принимает пакет аргументом: subpath-гранулярность
 * продаёт не только ядро, и копия скрипта в каждом пакете разошлась бы — обход
 * графа тут неочевиден, а ошибка в нём делает число вдвое меньше правды.
 *
 * `--check-coverage` не меряет ничего и `dist` не требует: он следит, чтобы
 * пакет с компонентными подпутями не остался без замера и без публикации веса —
 * оба скрипта на месте, блок в README заведён. Без этого следующий спутник
 * заводится молча незамеренным, ровно как эти шесть.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

class SizesError extends Error {}

function manifestOf(packageDir) {
  return JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'))
}

/** Пакеты, у которых гранулярность есть что мерить: компонент отдаётся своим подпутём. */
function granularPackages() {
  return readdirSync(resolve(ROOT, 'packages'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(resolve(ROOT, 'packages', entry.name, 'package.json')))
    .map(entry => ({ dir: resolve(ROOT, 'packages', entry.name), manifest: manifestOf(resolve(ROOT, 'packages', entry.name)) }))
    .filter(({ manifest }) => Object.keys(manifest.exports ?? {}).some(key => key.startsWith('./components/')))
}

function checkCoverage() {
  const packages = granularPackages()
  const gaps = []

  for (const { dir, manifest } of packages) {
    const readme = resolve(dir, 'README.md')
    const missing = [
      !manifest.scripts?.sizes && 'скрипт `sizes`',
      !manifest.scripts?.['sizes:docs'] && 'скрипт `sizes:docs`',
      (!existsSync(readme) || !readFileSync(readme, 'utf8').includes('entry-sizes:generated:start'))
      && 'маркер блока в README',
    ].filter(Boolean)

    if (missing.length > 0)
      gaps.push(`  ${manifest.name}: нет ${missing.join(', ')}`)
  }

  if (gaps.length > 0) {
    throw new SizesError(
      `${gaps.length} пакетов отдают компоненты подпутями, но вес у них не замерен и не опубликован:\n`
      + `${gaps.join('\n')}\n`
      + '  Образец — `packages/granularity-chrono`; разбор в `docs/companion-packages.md`.',
    )
  }

  console.log(`[entry-sizes] покрытие OK — вес меряют и публикуют все ${packages.length} пакетов с компонентными подпутями.`)
}

function report(packageDir) {
  const manifest = manifestOf(packageDir)

  if (!existsSync(resolve(packageDir, 'dist')))
    throw new SizesError(`${manifest.name}: нет \`dist\` — отчёт читает собранный пакет, сначала \`yarn build\``)

  const rows = measureEntries(packageDir, entriesFromExports(manifest.exports ?? {}))

  if (rows.length === 0)
    throw new SizesError(`${manifest.name}: в \`exports\` нет ни одного ESM-подпути — нечего мерить`)

  const heaviest = [...rows].sort((a, b) => b.gzip - a.gzip)[0]
  const total = rows.reduce((sum, row) => sum + row.gzip, 0)

  console.log(`### ${manifest.name}`)
  console.log('')
  console.log(formatReport(rows, { limit: 20 }))
  console.log('')
  console.log(`Всего entry: ${rows.length}. Самый тяжёлый — ${heaviest.entry} (${formatKb(heaviest.gzip)}).`)
  console.log(`Сумма по всем entry (с повторным счётом общих чанков): ${formatKb(total)}.`)

  const summary = process.env.GITHUB_STEP_SUMMARY

  if (summary) {
    appendFileSync(summary, [
      `### Вес гранулярных импортов — \`${manifest.name}\` (gzip)`,
      '',
      formatReport(rows, { limit: 20 }),
      '',
      `Всего entry: ${rows.length}.`,
      '',
    ].join('\n'))
  }
}

function main() {
  if (process.argv.includes('--check-coverage')) {
    checkCoverage()
    return
  }

  const target = process.argv[2]

  if (!target)
    throw new SizesError('usage: node scripts/report-entry-sizes.mjs <packageDir> | --check-coverage')

  const packageDir = resolve(process.cwd(), target)

  if (!existsSync(resolve(packageDir, 'package.json')))
    throw new SizesError(`в ${relative(ROOT, packageDir) || '.'} нет \`package.json\``)

  report(packageDir)
}

try {
  main()
}
catch (error) {
  if (error instanceof SizesError) {
    console.error(`✖ [entry-sizes] ${error.message}`)
    process.exit(1)
  }

  throw error
}
