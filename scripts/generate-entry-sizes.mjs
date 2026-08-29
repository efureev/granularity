import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import process from 'node:process'

import { componentEntries, entriesFromExports, formatKb, measureSet } from './entrySizes.mjs'

/**
 * Вес гранулярных импортов в README пакета и полной таблицей в его доках.
 *
 * Число на странице npm — самый убедительный аргумент за subpath-экспорт,
 * но публиковать поэнтрийные веса **списком** нельзя: они не складываются.
 * Общий чанк посчитан в каждой строке заново, и читатель, сложивший пять строк
 * ядра, получит 381 kB там, где заплатит 171. Поэтому в README идёт объединение
 * набора, а не сумма, и рядом сказано, что это такое.
 *
 * Строки блока выведены правилом, а не выбраны: барель, самый лёгкий компонент,
 * медианный и пять самых тяжёлых вместе. Выбирать «показательные» компоненты
 * значило бы подгонять витрину под нужную цифру — а худший случай, названный
 * худшим случаем, работает лучше подобранного.
 *
 * Числа — верхняя граница: это gzip всего, что entry тянет из `dist`. Бандлер
 * потребителя трясёт дальше и минифицирует повторно, поэтому реальный бандл
 * выйдет не больше. Так в блоке и написано.
 *
 * Язык блока объявлен в маркере (`lang=ru` / `lang=en`), а не угадан по тексту
 * README: READMEs пакетов написаны на обоих языках, и эвристика ошибалась бы
 * молча.
 *
 * `--check` сверяет **структуру**, а не байты: версию в шапке таблицы и состав
 * компонентов в ней. Точные килобайты сверять нельзя — `zlib` сжимает один и
 * тот же `dist` по-разному в разных средах: на macOS барель вышел 542.9 kB, на
 * линуксовом раннере 549.3 kB при совпадающем до файла графе (263 файла в
 * обоих). Это тот же класс, из-за которого в репозитории нет визуального гейта
 * в CI (`.claude/rules/testing.md`), и гейт, который нельзя удовлетворить в
 * двух средах сразу, чинят не подгонкой числа, а сменой предмета проверки.
 *
 * Свежесть самих чисел держит не сверка, а версия в шапке: она обязана
 * совпасть с `package.json`, поэтому каждый бамп версии требует перегенерации,
 * и веса не бывают старше одного релиза.
 */

const START = /<!-- entry-sizes:generated:start lang=(ru|en) -->/
const END = '<!-- entry-sizes:generated:end -->'
const DOC = 'docs/entry-sizes.md'

class SizesDocError extends Error {}

/** Набор строк сводки. Каждая выведена правилом — «показательный» компонент не выбирается руками. */
function summaryRows(packageDir, manifest) {
  const all = entriesFromExports(manifest.exports ?? {})
  const barrel = all.find(entry => entry.name === '.')

  if (!barrel)
    throw new SizesDocError(`${manifest.name}: нет корневого подпути — сравнивать не с чем`)

  const components = componentEntries(packageDir, manifest.exports ?? {})

  if (components.length === 0)
    throw new SizesDocError(`${manifest.name}: компонентных подпутей нет — блоку неоткуда взяться`)

  const heaviest = components.slice(-Math.min(5, components.length))

  return {
    barrel: measureSet(packageDir, [barrel]).gzip,
    lightest: components[0],
    median: components[Math.floor(components.length / 2)],
    heaviest,
    heaviestGzip: measureSet(packageDir, heaviest).gzip,
    components,
  }
}

const TEXT = {
  ru: {
    head: '| Что берут | gzip | от бареля |',
    barrel: 'весь пакет из корня',
    lightest: 'самый лёгкий компонент',
    median: 'медианный компонент',
    set: count => `${count} самых тяжёлых вместе`,
    only: 'единственный компонент',
    note: [
      'Числа **не складываются**: общий код посчитан в каждой строке заново, а платится один раз —',
      'поэтому набор компонентов и показан объединением, а не суммой. Это верхняя граница: gzip всего,',
      'что подпуть тянет из `dist`, а бандлер приложения трясёт дальше и минифицирует повторно.',
    ].join('\n'),
    full: doc => `Вес каждого компонента — [\`${doc}\`](./${doc}).`,
  },
  en: {
    head: '| What you import | gzip | of the barrel |',
    barrel: 'the whole package from the root',
    lightest: 'the lightest component',
    median: 'the median component',
    set: count => `the ${count} heaviest together`,
    only: 'the only component',
    note: [
      'These numbers **do not add up**: shared code is counted again in every row but paid for once, which is why',
      'the set is shown as a union rather than a sum. They are an upper bound — the gzip of everything a subpath',
      'pulls out of `dist`, before the application bundler shakes it further and minifies it again.',
    ].join('\n'),
    full: doc => `The weight of every component — [\`${doc}\`](./${doc}).`,
  },
}

function renderSummary(lang, summary) {
  const text = TEXT[lang]
  const row = (label, gzip) => `| ${label} | ${formatKb(gzip)} | ${share(summary.barrel, gzip)} |`
  const single = summary.components.length === 1

  // У пакета с одним компонентом «самый лёгкий» и «медианный» — он же: две
  // одинаковые строки читались бы как два разных замера.
  const componentRows = single
    ? [row(`${text.only} — \`${summary.lightest.owner}\``, summary.lightest.gzip)]
    : [
        row(`${text.lightest} — \`${summary.lightest.owner}\``, summary.lightest.gzip),
        ...(summary.median.owner === summary.lightest.owner
          ? []
          : [row(`${text.median} — \`${summary.median.owner}\``, summary.median.gzip)]),
        row(text.set(summary.heaviest.length), summary.heaviestGzip),
      ]

  return [
    '',
    text.head,
    '| --- | ---: | ---: |',
    row(text.barrel, summary.barrel),
    ...componentRows,
    '',
    text.note,
    '',
    text.full(DOC),
    '',
  ].join('\n')
}

/** Доля от бареля: «0 %» у лёгкого компонента читалось бы как «ничего не весит». */
function share(barrel, gzip) {
  const percent = gzip / barrel * 100

  return percent < 1 && percent > 0 ? '< 1 %' : `${Math.round(percent)} %`
}

/** Полная таблица — данные, поэтому файл генерируется целиком, как `docs/tokens.md`. */
function renderDoc(manifest, summary) {
  return [
    '# Вес гранулярных импортов',
    '',
    `> Сгенерировано \`yarn sizes:docs\` по собранному \`dist\` пакета \`${manifest.name}\` ${manifest.version}.`,
    '> Править руками бесполезно — правка потеряется на следующей сборке.',
    '',
    'Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет',
    'из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.',
    '',
    '**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз:'
    + ` сумма ${summary.heaviest.length} самых тяжёлых строк даёт`
    + ` ${formatKb(summary.heaviest.reduce((sum, row) => sum + row.gzip, 0))}, а вместе они весят`
    + ` ${formatKb(summary.heaviestGzip)}. Вес набора считается объединением — так его и считает \`yarn sizes\`.`,
    '',
    'Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.',
    '',
    '| Компонент | gzip | файлов | от бареля |',
    '| --- | ---: | ---: | ---: |',
    ...[...summary.components]
      .sort((a, b) => b.gzip - a.gzip)
      .map(row => `| \`${row.owner}\` | ${formatKb(row.gzip)} | ${row.files} | ${share(summary.barrel, row.gzip)} |`),
    '',
    `Весь пакет из корня — ${formatKb(summary.barrel)}.`,
    '',
  ].join('\n')
}

/**
 * Что таблица описывает не ту сборку: другую версию пакета или другой состав
 * компонентов. Килобайты сюда не входят — почему, сказано в шапке файла.
 */
function checkStructure(manifest, docPath, summary) {
  if (!existsSync(docPath))
    throw new SizesDocError(`${manifest.name}: нет ${DOC} — прогони \`yarn sizes:docs\``)

  const doc = readFileSync(docPath, 'utf8')
  const stated = /пакета `[^`]+` (\S+)\./.exec(doc)?.[1]

  if (stated !== manifest.version) {
    throw new SizesDocError(
      `${manifest.name}: ${DOC} описывает версию ${stated ?? '—'}, а в манифесте ${manifest.version}.`
      + ' Прогони `yarn build` и `yarn sizes:docs`',
    )
  }

  const listed = new Set([...doc.matchAll(/^\| `(Gr[A-Za-z0-9]+)` \|/gm)].map(match => match[1]))
  const actual = new Set(summary.components.map(row => row.owner))
  const missing = [...actual].filter(name => !listed.has(name))
  const extra = [...listed].filter(name => !actual.has(name))

  if (missing.length > 0 || extra.length > 0) {
    throw new SizesDocError(
      `${manifest.name}: состав ${DOC} разошёлся со сборкой.`
      + `${missing.length ? `\n  нет в таблице: ${missing.join(', ')}` : ''}`
      + `${extra.length ? `\n  лишние в таблице: ${extra.join(', ')}` : ''}`
      + '\n  Прогони `yarn sizes:docs`',
    )
  }
}

function main() {
  const check = process.argv.includes('--check')
  const target = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '.'
  const packageDir = resolve(process.cwd(), target)
  const manifestPath = resolve(packageDir, 'package.json')

  if (!existsSync(manifestPath))
    throw new SizesDocError(`в ${target} нет \`package.json\``)

  if (!existsSync(resolve(packageDir, 'dist')))
    throw new SizesDocError('нет `dist` — блок считается по собранному пакету, сначала `yarn build`')

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const summary = summaryRows(packageDir, manifest)

  const readmePath = resolve(packageDir, 'README.md')
  const readme = readFileSync(readmePath, 'utf8')
  const marker = START.exec(readme)

  if (!marker)
    throw new SizesDocError(`в README нет маркера \`<!-- entry-sizes:generated:start lang=ru|en -->\``)

  const to = readme.indexOf(END)

  if (to === -1)
    throw new SizesDocError(`в README нет закрывающего маркера ${END}`)

  const nextReadme = readme.slice(0, marker.index + marker[0].length)
    + renderSummary(marker[1], summary)
    + readme.slice(to)

  const docPath = resolve(packageDir, DOC)
  const nextDoc = renderDoc(manifest, summary)
  const staleDoc = !existsSync(docPath) || readFileSync(docPath, 'utf8') !== nextDoc
  const staleReadme = nextReadme !== readme

  if (check) {
    checkStructure(manifest, docPath, summary)

    console.log(`[entry-sizes] ${manifest.name}: версия и состав таблицы сходятся`
      + ` (${summary.components.length} компонентов, ${manifest.version})`)
    return
  }

  if (staleReadme)
    writeFileSync(readmePath, nextReadme)

  if (staleDoc)
    writeFileSync(docPath, nextDoc)

  const written = [staleReadme && 'README.md', staleDoc && DOC].filter(Boolean)

  console.log(`[entry-sizes] ${manifest.name}: ${written.length ? `обновлено ${written.join(', ')}` : 'без изменений'}`
    + ` (${summary.components.length} компонентов, ${relative(process.cwd(), packageDir) || '.'})`)
}

try {
  main()
}
catch (error) {
  if (error instanceof SizesDocError) {
    console.error(`✖ [entry-sizes] ${error.message}`)
    process.exit(1)
  }

  throw error
}
