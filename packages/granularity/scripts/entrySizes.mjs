import { gzipSync } from 'node:zlib'
import { readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

/**
 * Вес гранулярного импорта: сколько на самом деле приезжает потребителю,
 * взявшему один компонент.
 *
 * Считается не размер файла entry, а сумма по всему, что он тянет: у пакета с
 * отдельной entry на компонент общий код уезжает в `dist/chunks/`, и entry сам
 * по себе почти пустой. Число без транзитивных зависимостей врало бы в разы.
 *
 * Gzip — потому что по сети едет он, а не исходный байт. Разница между «сырым»
 * и сжатым весом у минифицированного JS доходит до четырёх раз.
 */

/** Статические импорты и реэкспорты собранного ESM. Динамических в dist нет. */
const IMPORT_RE = /(?:^|[\s;}])(?:import|export)\s*(?:[\s\S]*?\sfrom\s*)?["']([^"']+)["']/g

export function parseImports(source) {
  const found = []

  for (const match of source.matchAll(IMPORT_RE)) {
    const specifier = match[1]
    if (specifier.startsWith('.')) found.push(specifier)
  }

  return found
}

/**
 * Все файлы, которые приедут вместе с entry: сам файл плюс всё, до чего
 * дотягиваются относительные импорты. Внешние пакеты (`vue`) не в счёт — они
 * у потребителя уже есть.
 */
export function collectEntryFiles(entryFile, readFile = path => readFileSync(path, 'utf8')) {
  const seen = new Set()
  const pending = [resolve(entryFile)]

  while (pending.length > 0) {
    const current = pending.pop()
    if (seen.has(current)) continue

    let source
    try {
      source = readFile(current)
    }
    catch {
      // Файла нет — специфер вёл на что-то, чего в dist не собрано.
      continue
    }

    seen.add(current)

    for (const specifier of parseImports(source)) {
      pending.push(resolve(dirname(current), specifier))
    }
  }

  return [...seen]
}

export function gzipSize(files, readFile = path => readFileSync(path)) {
  let total = 0

  for (const file of files) {
    try {
      total += gzipSync(readFile(file)).length
    }
    catch {
      continue
    }
  }

  return total
}

export function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`
}

/** Таблица в Markdown: её читают в сводке прогона, а не в логе. */
export function formatReport(rows, { limit = rows.length } = {}) {
  const shown = [...rows].sort((a, b) => b.gzip - a.gzip).slice(0, limit)
  const lines = [
    `| Entry | gzip | файлов |`,
    `| --- | ---: | ---: |`,
    ...shown.map(row => `| \`${row.entry}\` | ${formatKb(row.gzip)} | ${row.files} |`),
  ]

  if (shown.length < rows.length) {
    lines.push('', `Показаны ${shown.length} самых тяжёлых из ${rows.length}.`)
  }

  return lines.join('\n')
}

export function measureEntries(packageDir, entries) {
  return entries.map(entry => {
    const files = collectEntryFiles(resolve(packageDir, entry.file))

    return {
      entry: entry.name,
      gzip: gzipSize(files),
      files: files.length,
      paths: files.map(file => relative(packageDir, file)),
    }
  })
}

/** Подпути `exports`, ведущие на собранный ESM. Типы и CSS в счёт не идут. */
export function entriesFromExports(exportsMap) {
  const entries = []

  for (const [name, value] of Object.entries(exportsMap)) {
    const file = typeof value === 'string' ? value : value?.import
    if (typeof file !== 'string' || !file.endsWith('.js')) continue

    entries.push({ name, file })
  }

  return entries
}
