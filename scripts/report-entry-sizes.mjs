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
 * пакет с компонентными подпутями не остался без скрипта `sizes`. Без этого
 * следующий спутник заводится молча незамеренным — ровно так и вышло у всех
 * шести существующих.
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
  const uncovered = granularPackages()
    .filter(({ manifest }) => !manifest.scripts?.sizes)
    .map(({ manifest }) => manifest.name)

  if (uncovered.length > 0) {
    throw new SizesError(
      `${uncovered.length} пакетов отдают компоненты подпутями, но веса не меряют:\n`
      + `${uncovered.map(name => `  ${name}`).join('\n')}\n`
      + '  Добавь `"sizes": "node ../../scripts/report-entry-sizes.mjs ."` и шаг в сборочную джобу.',
    )
  }

  console.log(`[entry-sizes] покрытие OK — вес меряют все ${granularPackages().length} пакетов с компонентными подпутями.`)
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
