import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * Генерация блока «Быстрый выбор» в `docs/COMPONENT-MAP.md`.
 *
 * Карта отвечает на вопрос «какой компонент взять под эту задачу» по всем
 * пакетам сразу, и состоит из двух разных по природе частей:
 *
 *   «Развилки»      — пишутся руками: различающий вопрос («блокирует ли
 *                     страницу?», «кто рисует ячейку?») из страниц не выводится,
 *                     это акт проектирования;
 *   «Быстрый выбор» — генерируется отсюда: строка повторяет первый тезис секции
 *                     `## Когда брать` соответствующей страницы, и рукописная
 *                     копия разошлась бы с ней молча.
 *
 * `--check` дополнительно требует, чтобы **каждый** компонент стоял хотя бы в
 * одной развилке. Это единственный механизм, заставляющий пересматривать
 * границы при появлении соседа: новый компонент красит CI, пока автор не
 * решил, чем он отличается от существующих и кого вытесняет.
 *
 * Скрипт живёт в корне репозитория, а не в пакете: он читает все пакеты сразу,
 * а пакет не должен писать за пределы своего дерева.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MAP_PATH = resolve(ROOT, 'docs/COMPONENT-MAP.md')

const START = '<!-- component-map:generated:start -->'
const END = '<!-- component-map:generated:end -->'

/** Пакеты с компонентами и их метки в колонке «Пакет». */
const PACKAGES = [
  { dir: 'packages/granularity', label: 'ядро' },
  { dir: 'packages/granularity-charts', label: 'charts' },
  { dir: 'packages/granularity-code', label: 'code' },
  { dir: 'packages/granularity-chrono', label: 'chrono' },
  { dir: 'packages/granularity-dashboard', label: 'dashboard' },
  { dir: 'packages/granularity-editor', label: 'editor' },
  { dir: 'packages/granularity-forms-schema', label: 'forms-schema' },
  { dir: 'packages/granularity-media', label: 'media' },
]

class MapError extends Error {}

/** Публичный компонент = директория с `index.ts` и `config.ts`. */
function publicComponents(pkgDir) {
  const componentsDir = resolve(ROOT, pkgDir, 'src/components')

  if (!existsSync(componentsDir))
    return []

  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => (
      existsSync(resolve(componentsDir, name, 'index.ts'))
      && existsSync(resolve(componentsDir, name, 'config.ts'))
    ))
    .sort()
}

/**
 * Первый тезис секции `## Когда брать`.
 *
 * Тезис выделен жирным по формату страницы (`- **тезис** — пояснение`), и
 * берётся именно он: пояснение раскрывает сценарий, а в таблицу нужен признак.
 */
function firstTake(markdown, component) {
  const section = markdown.split(/^## /m).find(part => part.startsWith('Когда брать'))

  if (!section)
    throw new MapError(`${component}: нет секции «Когда брать»`)

  const bullet = section.split('\n').find(line => /^\s*-\s+\S/.test(line))

  if (!bullet)
    throw new MapError(`${component}: секция «Когда брать» без пунктов`)

  const bold = /\*\*(.+?)\*\*/.exec(bullet)

  if (bold?.[1])
    return bold[1].trim()

  return bullet.replace(/^\s*-\s+/, '').split(' — ')[0].trim()
}

function collect() {
  const rows = []

  for (const { dir, label } of PACKAGES) {
    const docsDir = resolve(ROOT, dir, 'docs/components')

    for (const component of publicComponents(dir)) {
      const page = resolve(docsDir, `${component}.md`)

      if (!existsSync(page))
        throw new MapError(`${component}: нет страницы ${relative(ROOT, page)}`)

      rows.push({
        component,
        label,
        href: relative(dirname(MAP_PATH), page),
        take: firstTake(readFileSync(page, 'utf8'), component),
      })
    }
  }

  return rows.sort((a, b) => a.component.localeCompare(b.component))
}

function renderTable(rows) {
  return [
    '',
    '| Компонент | Пакет | Берут, когда |',
    '| --- | --- | --- |',
    ...rows.map(row => `| [\`${row.component}\`](${row.href}) | ${row.label} | ${row.take} |`),
    '',
  ].join('\n')
}

function replaceBlock(source, table) {
  const from = source.indexOf(START)
  const to = source.indexOf(END)

  if (from === -1 || to === -1)
    throw new MapError(`в ${relative(ROOT, MAP_PATH)} нет маркеров ${START} … ${END}`)

  return source.slice(0, from + START.length) + table + source.slice(to)
}

/** Часть карты до генерируемого блока — рукописные развилки. */
function forksSection(source) {
  return source.slice(0, source.indexOf('## Быстрый выбор'))
}

function checkForks(source, rows) {
  const forks = forksSection(source)
  const missing = rows
    .filter(row => !forks.includes(`\`${row.component}\``))
    .map(row => row.component)

  if (missing.length) {
    throw new MapError(
      `не стоят ни в одной развилке: ${missing.join(', ')}\n`
      + '  Развилка — это решение о том, чем компонент отличается от соседей.\n'
      + '  Назвать её не получается — вероятно, компонент дублирует существующий.',
    )
  }
}

function checkLinks(source) {
  const broken = [...forksSection(source).matchAll(/\]\(([^)]+\.md)\)/g)]
    .map(match => match[1])
    .filter(link => !existsSync(resolve(dirname(MAP_PATH), link)))

  if (broken.length)
    throw new MapError(`ссылки развилок ведут в никуда: ${[...new Set(broken)].join(', ')}`)
}

function main() {
  const check = process.argv.includes('--check')
  const source = readFileSync(MAP_PATH, 'utf8')
  const rows = collect()
  const next = replaceBlock(source, renderTable(rows))

  checkForks(source, rows)
  checkLinks(source)

  if (check) {
    if (next !== source)
      throw new MapError(`${relative(ROOT, MAP_PATH)} разошёлся со страницами компонентов — прогони \`yarn docs:map\``)

    console.log(`карта актуальна: ${rows.length} компонентов`)
    return
  }

  if (next === source) {
    console.log(`карта не изменилась: ${rows.length} компонентов`)
    return
  }

  writeFileSync(MAP_PATH, next)
  console.log(`обновлено: ${relative(ROOT, MAP_PATH)}, ${rows.length} компонентов`)
}

try {
  main()
}
catch (error) {
  if (error instanceof MapError) {
    console.error(`✖ ${error.message}`)
    process.exit(1)
  }

  throw error
}
