import { appendFileSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { entriesFromExports, formatKb, formatReport, measureEntries } from './entrySizes.mjs'

/**
 * Отчёт о весе гранулярных импортов. Запускается после сборки — по `dist`.
 *
 * Гейта здесь нет намеренно: порог, взятый с потолка, начнёт краснеть на
 * честном росте компонента, и его научатся поднимать не глядя. Задача отчёта —
 * сделать вес видимым в сводке прогона, чтобы скачок заметили в ревью.
 */
const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'))

const rows = measureEntries(packageDir, entriesFromExports(manifest.exports ?? {}))

if (rows.length === 0) {
  console.error('[entry-sizes] в `exports` нет ни одного ESM-подпути — нечего мерить')
  process.exit(1)
}

const heaviest = [...rows].sort((a, b) => b.gzip - a.gzip)
const total = rows.reduce((sum, row) => sum + row.gzip, 0)

console.log(formatReport(rows, { limit: 20 }))
console.log('')
console.log(`Всего entry: ${rows.length}. Самый тяжёлый — ${heaviest[0].entry} (${formatKb(heaviest[0].gzip)}).`)
console.log(`Сумма по всем entry (с повторным счётом общих чанков): ${formatKb(total)}.`)

const summary = process.env.GITHUB_STEP_SUMMARY
if (summary) {
  appendFileSync(summary, [
    '### Вес гранулярных импортов (gzip)',
    '',
    formatReport(rows, { limit: 20 }),
    '',
    `Всего entry: ${rows.length}.`,
    '',
  ].join('\n'))
}
