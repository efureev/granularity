import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import semver from 'semver'

/**
 * Реестр пакетов экосистемы: кто входит в семейство, какой версии, что даёт.
 *
 * Тот же принцип, что у реестров компонентов и токенов: перечень выводится из
 * репозитория, а не переписывается руками в каждом месте, где он нужен. Мест
 * этих три — входная дока потребителя, лицо репозитория и страница пакета в
 * npm, — и рукописные копии разошлись все: `getting-started.md` знал четыре
 * пакета из одиннадцати и версию ядра, отставшую на восемнадцать миноров.
 *
 * Описание берётся из `package.json#description`, а не пишется здесь: ровно оно
 * стоит на странице пакета в npm, и второй текст про тот же пакет разошёлся бы
 * с первым молча.
 *
 * `--check` дополнительно требует, чтобы ни одна версия `@feugene/*`, названная
 * в доках, не исключала текущую версию из репозитория. Диапазон-пример
 * (`>=0.21.0 <1.0.0`) остаётся верным и претензии не вызывает — ловится только
 * то, что потребитель воспроизвести уже не может.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const START = '<!-- ecosystem:generated:start -->'
const END = '<!-- ecosystem:generated:end -->'

/** Файлы, где версия `@feugene/*` названа в тексте или в примере конфига. */
const VERSION_MENTIONS = [
  'README.md',
  ...readdirSync(resolve(ROOT, 'packages'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => `packages/${entry.name}/README.md`),
  ...readdirSync(resolve(ROOT, 'packages/granularity/docs'))
    .filter(file => file.endsWith('.md'))
    .map(file => `packages/granularity/docs/${file}`),
].filter(path => existsSync(resolve(ROOT, path)))

class EcosystemError extends Error {}

/** Публичный компонент = директория с `index.ts` и `config.ts`, как в карте компонентов. */
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

function firstMatch(pkgDir, file, pattern) {
  const path = resolve(ROOT, pkgDir, file)

  return existsSync(path) ? pattern.exec(readFileSync(path, 'utf8'))?.[1] ?? null : null
}

/**
 * Резолвер авто-импорта пакета.
 *
 * Фабрики (`createGranularResolver`) отсеиваются: потребитель подключает
 * готовый резолвер, а фабрику берут те, кто собирает свой.
 */
function resolverExport(pkgDir) {
  const path = resolve(ROOT, pkgDir, 'src/resolver.ts')

  if (!existsSync(path))
    return null

  return [...readFileSync(path, 'utf8').matchAll(/export function ([A-Za-z]+Resolver)\b/g)]
    .map(match => match[1])
    .find(name => !name.startsWith('create')) ?? null
}

function collect() {
  const rows = readdirSync(resolve(ROOT, 'packages'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(resolve(ROOT, 'packages', entry.name, 'package.json')))
    .map(({ name: pkg }) => {
      const dir = `packages/${pkg}`
      const manifest = JSON.parse(readFileSync(resolve(ROOT, dir, 'package.json'), 'utf8'))
      const components = publicComponents(dir)

      if (!manifest.description)
        throw new EcosystemError(`${manifest.name}: нет \`description\` — реестр берёт описание оттуда`)

      return {
        dir,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        components,
        subpaths: Object.keys(manifest.exports ?? {}).filter(key => key.startsWith('./components/')).length,
        i18nBlock: firstMatch(dir, 'src/i18n/messages/const.ts', /=\s*'([^']+)'/),
        resolver: resolverExport(dir),
        isCore: manifest.name === '@feugene/granularity',
      }
    })
    .sort((a, b) => Number(b.isCore) - Number(a.isCore) || a.name.localeCompare(b.name))

  const core = rows.find(row => row.isCore)

  if (!core)
    throw new EcosystemError('в `packages/` нет ядра — реестр строится вокруг него')

  /**
   * У спутника резолвер лежит в нём самом, у ядра — в пакете-резолвере: ядру
   * плагин авто-импорта не нужен, а потребителю нужен именно он.
   */
  const resolverPackage = rows.find(row => row.name.includes('unplugin'))

  if (resolverPackage?.resolver) {
    core.resolver = resolverPackage.resolver
    core.resolverFrom = resolverPackage.name
  }

  return rows
}

/** Пакет компонентов от инструментального отличается наличием компонентов, а не названием. */
const isComponentPackage = row => row.components.length > 0

function link(row, fromFile) {
  return relative(dirname(resolve(ROOT, fromFile)), resolve(ROOT, row.dir)) || '.'
}

/**
 * Входная дока потребителя: таблица подключаемых пакетов.
 *
 * Состав компонентов держится только у спутников: у ядра он не помещается, и
 * число подпутей там информативнее списка из 78 имён. Описания в таблицу не
 * идут — они живут в `package.json` по-английски, а документ русский.
 */
function renderGettingStarted(rows) {
  const components = rows.filter(isComponentPackage)
  const tools = rows.filter(row => !isComponentPackage(row))
  const target = 'packages/granularity/docs/getting-started.md'

  return [
    '',
    '| Пакет | Версия | Компоненты | Блок i18n | Резолвер |',
    '| --- | --- | --- | --- | --- |',
    ...components.map(row => [
      `| \`${row.name}\``,
      row.version,
      row.isCore ? `ядро, ${row.subpaths} subpath-экспортов \`./components/Gr*\`` : row.components.map(c => `\`${c}\``).join(', '),
      row.i18nBlock ? `\`${row.i18nBlock}\`` : '—',
      row.resolver
        ? `\`${row.resolver}\`${row.resolverFrom ? ` (из \`${row.resolverFrom}\`)` : ''}`
        : '—',
    ].join(' | ') + ' |'),
    '',
    'Компонентов не добавляют, но входят в семейство:',
    '',
    ...tools.map(row => `- [\`${row.name}\`](${link(row, target)}) \`${row.version}\``),
    '',
  ].join('\n')
}

/** Лицо репозитория: список пакетов со ссылками на их README. */
function renderRootReadme(rows) {
  return [
    '',
    ...rows.map(row => `- [\`${row.name}\`](./${link(row, 'README.md')}/README.md) \`${row.version}\` — ${row.description}`),
    '',
  ].join('\n')
}

/**
 * Страница ядра в npm: соседи по семейству, о которых иначе никак не узнать.
 *
 * «for @feugene/granularity» из описания снимается: на странице самого ядра
 * это сказано в каждой строке и вытесняет из колонки то, ради чего её читают.
 * Снимается только оборот, за которым сразу идёт тире или двоеточие: там он
 * законченный. В «Test gates for @feugene/granularity design-system packages»
 * вырезка оставила бы обрубок, поэтому такое описание идёт как есть.
 */
function renderCoreReadme(rows) {
  return [
    '',
    '| Package | Version | What it adds |',
    '| --- | --- | --- |',
    ...rows
      .filter(row => !row.isCore)
      .map(row => `| [\`${row.name}\`](${link(row, 'packages/granularity/README.md')}) | ${row.version} `
        + `| ${row.description.replace(/\s+for (?:the )?@feugene\/granularity(?: design system)?(?=\s*[—:])/, '')} |`),
    '',
  ].join('\n')
}

const TARGETS = [
  { file: 'packages/granularity/docs/getting-started.md', render: renderGettingStarted },
  { file: 'README.md', render: renderRootReadme },
  { file: 'packages/granularity/README.md', render: renderCoreReadme },
]

function replaceBlock(source, block, file) {
  const from = source.indexOf(START)
  const to = source.indexOf(END)

  if (from === -1 || to === -1)
    throw new EcosystemError(`в ${file} нет маркеров ${START} … ${END}`)

  return source.slice(0, from + START.length) + block + source.slice(to)
}

/**
 * Версия `@feugene/*`, названная в тексте или примере конфига.
 *
 * Проверяется покрытием, а не равенством: `^0.38.0` и `>=0.21.0 <1.0.0` оба
 * верны, пока текущая версия им удовлетворяет. Претензия только к тому, что
 * потребитель уже не воспроизведёт.
 */
function checkVersionMentions(rows) {
  const known = new Map(rows.map(row => [row.name, row.version]))
  const preset = JSON.parse(readFileSync(resolve(ROOT, 'packages/granularity/package.json'), 'utf8'))
    .devDependencies?.['@feugene/unocss-preset-granular']

  if (preset)
    known.set('@feugene/unocss-preset-granular', preset.replace(/^[\^~]/, ''))

  const stale = []

  for (const file of VERSION_MENTIONS) {
    const source = readFileSync(resolve(ROOT, file), 'utf8')

    for (const [, name, range] of source.matchAll(/(@feugene\/[a-z-]+)["'`]?\s*:?\s*["'`]?([\^~]?\d+\.\d+\.\d+)/g)) {
      const version = known.get(name)

      if (version && !semver.satisfies(version, range))
        stale.push(`${file}: ${name} ${range}, а в репозитории ${version}`)
    }
  }

  if (stale.length > 0) {
    throw new EcosystemError(
      `${stale.length} версий в доках потребитель уже не поставит:\n`
      + `${stale.map(line => `  ${line}`).join('\n')}\n`
      + '  Диапазон-пример устаревает молча: он остаётся синтаксически верным.',
    )
  }
}

function main() {
  const check = process.argv.includes('--check')
  const rows = collect()

  checkVersionMentions(rows)

  const changed = []

  for (const { file, render } of TARGETS) {
    const path = resolve(ROOT, file)
    const source = readFileSync(path, 'utf8')
    const next = replaceBlock(source, render(rows), file)

    if (next === source)
      continue

    if (!check)
      writeFileSync(path, next)

    changed.push(file)
  }

  if (check && changed.length > 0) {
    throw new EcosystemError(
      `реестр разошёлся с репозиторием: ${changed.join(', ')}\n`
      + '  Прогони `yarn docs:ecosystem`.',
    )
  }

  console.log(check
    ? `реестр актуален: ${rows.length} пакетов`
    : `обновлено: ${changed.join(', ') || 'ничего'} (${rows.length} пакетов)`)
}

try {
  main()
}
catch (error) {
  if (error instanceof EcosystemError) {
    console.error(`✖ ${error.message}`)
    process.exit(1)
  }

  throw error
}
