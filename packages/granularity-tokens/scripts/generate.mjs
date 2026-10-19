import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { runnerImport } from 'vite'

/**
 * Генерация из реестра и данных тем.
 *
 *   tokens/{foundation,roles,derived}.json — реестр: имена, группы, описания, формулы;
 *   themes/<slug>/                          — значения темы: theme.json, root.json, modes/*.json,
 *                                             notes.json (пояснения к значениям для CSS и доки).
 *
 * Каждая тема строится `defineTheme` — тем же кодом, что у приложения. Отсюда:
 *   src/generated.ts                — реестр и каталог тем для TS-потребителей;
 *   src/theme/builtin.generated.ts  — режимы темы по умолчанию для `extendTheme`/`tone`;
 *   docs/tokens.md                  — справочник;
 *   CSS ядра `@feugene/granularity` — `src/styles/tokens.css` и `themes/{light,dark}.css`
 *                                     темы по умолчанию, пока ядро не берёт тему через каталог granum.
 *
 * `--dist` пишет раскладку `dist/` (данные тем, реестр для granum, формулы) — шаг сборки.
 * `--check` только сверяет и падает на расхождении (гейт `src/__tests__/generated.test.ts`).
 *
 * Модули пакета грузятся через `runnerImport` vite: они на TypeScript с
 * импортами без расширений, и запускать их голым node нельзя.
 */

const pkgDir = fileURLToPath(new URL('..', import.meta.url))
const coreDir = resolve(pkgDir, '../granularity')

const DEFAULT_THEME = 'slate'

const GENERATED_BANNER_TS
  = '// СГЕНЕРИРОВАНО `yarn workspace @feugene/granularity-tokens generate` — правки здесь потеряются.'

const CORE_BANNER_CSS = [
  '/*',
  ' * СГЕНЕРИРОВАНО `yarn workspace @feugene/granularity-tokens generate` из темы `slate`',
  ' * пакета `@feugene/granularity-tokens` — правки здесь потеряются.',
  ' * Менять значения и комментарии нужно там, затем перегенерировать.',
  ' */',
].join('\n')

/**
 * Селекторы CSS ядра по режимам. Это раскладка ядра 1.x: на каталоге granum 3
 * селекторы назначает сборка приложения, и этот блок уходит вместе с записью
 * CSS ядра.
 */
const CORE_MODES = {
  light: {
    selectors: [':root', '[data-theme=\'light\']', '.light'],
    note: [
      'Светлая тема. Кроме `:root` — атрибут `[data-theme=\'light\']` и класс `.light`:',
      'остров `GrConfigProvider theme="light"` внутри тёмной страницы объявляет роли на',
      'себе и перекрывает унаследованные тёмные.',
    ].join('\n'),
  },
  dark: {
    selectors: ['[data-theme=\'dark\']', '.dark'],
    note: [
      'Тёмная тема. Канон — атрибут `[data-theme=\'dark\']` на `<html>` (его ставит',
      '`useTheme`/`initThemeEarly`). Селектор `.dark` оставлен для интеропа с',
      'class-стратегией Tailwind/UnoCSS: приложение может уже переключать тему им.',
    ].join('\n'),
  },
}

/** Где пересчитываются производные в CSS ядра: корень и любой остров темы. */
const CORE_DERIVED_SELECTORS = [':root', '[data-theme]', '.light', '.dark']
/** То же для формул пакета токенов: классов режимов granum 3 не выводит. */
const DERIVED_SELECTORS = [':root', '[data-theme]']

const NO_COLOR_MIX_RULE = '@supports not (color: color-mix(in srgb, #000 50%, #fff)) {'

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function load(relativePath) {
  const { module } = await runnerImport(resolve(pkgDir, relativePath), { configFile: false, logLevel: 'silent' })
  return module
}

const bare = name => name.replace(/^--/, '')

// --- данные ----------------------------------------------------------------

async function readData() {
  const [{ buildRegistry }, { defineTheme }, { resolveModes }, { readThemeSource }] = await Promise.all([
    load('src/registry.ts'),
    load('src/theme/defineTheme.ts'),
    load('src/modes.ts'),
    load('src/theme/node.ts'),
  ])

  const [foundation, roles, derived] = await Promise.all(
    ['foundation', 'roles', 'derived'].map(name => readJson(resolve(pkgDir, `tokens/${name}.json`))),
  )
  const registry = buildRegistry({ foundation, roles, derived })

  const themesDir = resolve(pkgDir, 'themes')
  const sources = readdirSync(themesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(resolve(themesDir, entry.name, 'theme.json')))
    .map(entry => ({ dir: resolve(themesDir, entry.name), ...readThemeSource(resolve(themesDir, entry.name)) }))
    .sort((a, b) => a.input.id.localeCompare(b.input.id))

  for (const source of sources) {
    if (source.input.id !== source.dir.split('/').at(-1))
      throw new Error(`themes/${source.dir.split('/').at(-1)}: id темы "${source.input.id}" обязан совпадать с именем папки`)
  }

  // База собирается раньше наследника: `extends` ссылается на готовые данные.
  const built = {}
  const pending = [...sources]
  while (pending.length > 0) {
    const index = pending.findIndex(source => source.extends === undefined || built[source.extends])
    if (index === -1)
      throw new Error(`темы с неразрешимым \`extends\`: ${pending.map(source => `${source.input.id} → ${source.extends}`).join(', ')}`)

    const [source] = pending.splice(index, 1)
    built[source.input.id] = defineTheme(source.input, { registry, themes: built })
  }

  const themes = sources.map(source => ({
    source,
    data: built[source.input.id],
    notes: existsSync(resolve(source.dir, 'notes.json')) ? JSON.parse(readFileSync(resolve(source.dir, 'notes.json'), 'utf8')) : {},
  }))

  if (!built[DEFAULT_THEME])
    throw new Error(`нет темы по умолчанию "${DEFAULT_THEME}"`)

  return { raw: { foundation, roles, derived }, registry, themes, resolveModes }
}

// --- CSS ядра --------------------------------------------------------------

function renderNote(note, indent) {
  const lines = note.split('\n')
  if (lines.length === 1)
    return [`${indent}/* ${lines[0]} */`]

  return [`${indent}/*`, ...lines.map(line => `${indent} * ${line}`.trimEnd()), `${indent} */`]
}

function renderGroup(group, values, notes, indent) {
  const groupNote = group.note ?? notes.groups?.[group.title]
  const lines = groupNote
    ? renderNote(`${group.title}\n\n${groupNote}`, indent)
    : [`${indent}/* ${group.title} */`]

  for (const token of group.tokens) {
    const note = notes.tokens?.[bare(token.name)]
    if (note)
      lines.push(...renderNote(note, indent))

    lines.push(`${indent}${token.name}: ${values[bare(token.name)]};`)
  }

  return lines
}

function renderDerivedBlock(derived, selectors) {
  const lines = [`${selectors.join(',\n')} {`]

  for (const [index, group] of derived.groups.entries()) {
    if (index > 0)
      lines.push('')

    lines.push(`  /* ${group.title} */`)

    for (const token of group.tokens)
      lines.push(`  ${token.name}: color-mix(in srgb, var(${token.base}) ${token.amount}%, var(${token.mixWith}));`)
  }

  lines.push('}', '')

  return lines
}

function renderCoreTokensCss({ raw }, theme) {
  const lines = [CORE_BANNER_CSS, ':root {']

  for (const [index, group] of raw.foundation.groups.entries()) {
    if (index > 0)
      lines.push('')

    lines.push(...renderGroup(group, theme.data.root, {}, '  '))
  }

  lines.push('}', '')

  // Формулы — и на каждом элементе, объявляющем тему, а не только на `:root`.
  // Значение `var()` в кастомном свойстве подставляется там, где свойство
  // объявлено, и наследуется уже готовым: остров `data-theme` внутри страницы
  // другой темы получил бы hover-цвета, посчитанные от ролей страницы.
  lines.push(...renderDerivedBlock(raw.derived, CORE_DERIVED_SELECTORS))

  return lines.join('\n')
}

function renderCoreModeCss({ raw, resolveModes }, theme, mode) {
  const { selectors, note } = CORE_MODES[mode]
  const values = resolveModes(theme.data).get(mode)
  const data = theme.data.modes[mode]
  const notes = theme.notes.modes?.[mode] ?? {}
  const lines = [CORE_BANNER_CSS, ...renderNote(note, ''), `${selectors.join(',\n')} {`]

  // Нативные контролы и полосы прокрутки острова следуют его теме, а не странице.
  lines.push(`  color-scheme: ${data.colorScheme};`, '')

  for (const [index, group] of raw.roles.groups.entries()) {
    if (index > 0)
      lines.push('')

    lines.push(...renderGroup(group, values, notes, '  '))
  }

  lines.push('}', '')

  // Фолбэк для браузеров без `color-mix`: та же формула, посчитанная заранее.
  const fallbacks = data.fallbacks?.[0]?.tokens ?? {}
  lines.push(NO_COLOR_MIX_RULE)
  lines.push(`${selectors.map(item => `  ${item}`).join(',\n')} {`)

  for (const [index, group] of raw.derived.groups.entries()) {
    if (index > 0)
      lines.push('')

    lines.push(`    /* ${group.fallbackTitle} */`)

    for (const token of group.tokens) {
      const value = fallbacks[bare(token.name)]
      if (value === undefined)
        throw new Error(`тема ${theme.data.id}, режим ${mode}: нет фолбэка ${token.name}`)

      lines.push(`    ${token.name}: ${value};`)
    }
  }

  lines.push('  }', '}', '')

  return lines.join('\n')
}

// --- TS --------------------------------------------------------------------

function catalogEntry({ source, data }) {
  return {
    id: data.id,
    title: data.title,
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.docs !== undefined ? { docs: data.docs } : {}),
    ...(source.extends !== undefined ? { extends: source.extends } : {}),
    defaultMode: data.defaultMode,
    modes: Object.entries(data.modes).map(([name, mode]) => ({
      name,
      ...(mode.title !== undefined ? { title: mode.title } : {}),
      colorScheme: mode.colorScheme,
    })),
  }
}

function renderTs({ registry, themes }) {
  const literal = value => JSON.stringify(value, null, 2)

  return [
    GENERATED_BANNER_TS,
    '',
    'import type { GrDerivedToken, GrFoundationToken, GrRoleToken, GrThemeCatalogEntry } from \'./types\'',
    '',
    `export const grFoundationTokens: GrFoundationToken[] = ${literal(registry.foundation)}`,
    '',
    `export const grRoleTokens: GrRoleToken[] = ${literal(registry.roles)}`,
    '',
    `export const grDerivedTokens: GrDerivedToken[] = ${literal(registry.derived)}`,
    '',
    `export const grThemeCatalog: GrThemeCatalogEntry[] = ${literal(themes.map(catalogEntry))}`,
    '',
  ].join('\n')
}

function renderBuiltinTs({ resolveModes }, theme) {
  const modes = resolveModes(theme.data)
  const builtin = Object.fromEntries([...modes].map(([name, tokens]) => [
    name,
    Object.fromEntries(Object.entries(tokens).map(([token, value]) => [`--${token}`, value])),
  ]))

  return [
    GENERATED_BANNER_TS,
    '',
    `/** Режимы темы \`${theme.data.id}\` — база \`extendTheme\` и \`tone\` по имени. */`,
    `export type GrBuiltinMode = ${[...modes.keys()].map(name => `'${name}'`).join(' | ')}`,
    '',
    `export const grBuiltinModes: Record<GrBuiltinMode, Record<string, string>> = ${JSON.stringify(builtin, null, 2)}`,
    '',
  ].join('\n')
}

// --- docs ------------------------------------------------------------------

function renderDocs({ raw, themes, resolveModes }) {
  const pairs = themes.flatMap(theme => Object.keys(theme.data.modes).map(mode => ({ theme, mode, label: `${theme.data.id}-${mode}` })))
  const resolved = new Map(themes.map(theme => [theme.data.id, resolveModes(theme.data)]))
  const valueOf = (pair, name) => resolved.get(pair.theme.data.id).get(pair.mode)[bare(name)]

  const lines = [
    '<!-- СГЕНЕРИРОВАНО `yarn workspace @feugene/granularity-tokens generate` — правки здесь потеряются. -->',
    '',
    '# Токены дизайн-системы',
    '',
    'Реестр — `tokens/*.json` пакета: какие токены есть и что значат. Значения — в',
    'данных темы, `themes/<slug>/`. Из них генерируются TS-справочник',
    '`@feugene/granularity-tokens`, данные тем в `dist/themes/` и этот документ.',
    '',
    `Темы: ${themes.map(theme => `\`${theme.data.id}\` (${theme.data.title})`).join(', ')}.`,
    '',
    '## Примитивы',
    '',
    'Не зависят от режима: тема задаёт их в `root.json`.',
    '',
  ]

  for (const group of raw.foundation.groups) {
    lines.push(`### ${group.title}`, '')

    if (group.note)
      lines.push(...group.note.split('\n'), '')

    lines.push(`| Токен | ${themes.map(theme => theme.data.id).join(' | ')} | Назначение |`)
    lines.push(`| --- | ${themes.map(() => '---').join(' | ')} | --- |`)

    for (const token of group.tokens)
      lines.push(`| \`${token.name}\` | ${themes.map(theme => `\`${theme.data.root[bare(token.name)]}\``).join(' | ')} | ${token.description} |`)

    lines.push('')
  }

  lines.push(
    '## Роли по режимам',
    '',
    'Своё значение в каждом режиме темы: колонка — пара `<тема>-<режим>`.',
    'Значения выверены по контрасту — см. примечания.',
    '',
    'Две вещи про этот раздел, которые не видно по самим таблицам.',
    '',
    '**Роль с парой `-fg` автоматически считается тоном.** `validateTheme` выводит',
    'список тонов из данных — «роль, у которой есть `-fg`», — а не из записанного списка,',
    'чтобы новый тон попадал под проверки контраста сам. Побочный эффект: такие роли',
    'потребляются кодом, который нигде не пишет их имя буквально, и поиском по',
    'исходникам они не находятся.',
    '',
    '**Каждая объявленная здесь роль обязательна для каждого режима.** `defineTheme`',
    'и `extendTheme` падают с перечнем недостающих, если тема не задала хотя бы одну.',
    'Поэтому роль из этого раздела нельзя удалить как «неиспользуемую», даже если',
    'её не читает ни один компонент: это ломающее изменение для всех, кто собрал',
    'свою тему.',
    '',
  )

  for (const group of raw.roles.groups) {
    lines.push(`### ${group.title}`, '')
    lines.push(`| Токен | ${pairs.map(pair => pair.label).join(' | ')} | Назначение |`)
    lines.push(`| --- | ${pairs.map(() => '---').join(' | ')} | --- |`)

    for (const token of group.tokens)
      lines.push(`| \`${token.name}\` | ${pairs.map(pair => `\`${valueOf(pair, token.name)}\``).join(' | ')} | ${token.description} |`)

    lines.push('')

    for (const pair of pairs) {
      const notes = pair.theme.notes.modes?.[pair.mode]?.tokens ?? {}
      for (const token of group.tokens) {
        const note = notes[bare(token.name)]
        if (note)
          lines.push(`> **\`${token.name}\` (${pair.label}).** ${note.split('\n').join(' ')}`, '')
      }
    }
  }

  lines.push(
    '## Производные состояния',
    '',
    'Объявлены формулой `color-mix`; для браузеров без её поддержки тема несёт',
    'тот же результат, посчитанный заранее (`fallbacks` режима).',
    '',
    `| Токен | Формула | ${pairs.map(pair => `${pair.label} (fallback)`).join(' | ')} | Назначение |`,
    `| --- | --- | ${pairs.map(() => '---').join(' | ')} | --- |`,
  )

  for (const group of raw.derived.groups) {
    for (const token of group.tokens) {
      const values = pairs
        .map(pair => `\`${pair.theme.data.modes[pair.mode].fallbacks?.[0]?.tokens[bare(token.name)] ?? '—'}\``)
        .join(' | ')

      lines.push(`| \`${token.name}\` | \`${token.amount}% ${token.base}\` + \`${token.mixWith}\` | ${values} | ${token.description} |`)
    }
  }

  lines.push('')

  return lines.join('\n')
}

// --- dist ------------------------------------------------------------------

function distOutputs({ raw, registry, themes }) {
  const kinds = Object.fromEntries([
    ...registry.foundation.map(token => [bare(token.name), 'root']),
    ...registry.roles.map(token => [bare(token.name), 'mode']),
  ])

  return [
    ['dist/themes/registry.json', `${JSON.stringify(kinds, null, 2)}\n`],
    ['dist/tokens.css', renderDerivedBlock(raw.derived, DERIVED_SELECTORS).join('\n')],
    ...themes.map(theme => [`dist/themes/${theme.data.id}/theme.json`, `${JSON.stringify(theme.data, null, 2)}\n`]),
  ]
}

// --- запись ----------------------------------------------------------------

async function main() {
  const check = process.argv.includes('--check')
  const dist = process.argv.includes('--dist')
  const data = await readData()
  const slate = data.themes.find(theme => theme.data.id === DEFAULT_THEME)

  const outputs = dist
    ? distOutputs(data)
    : [
        ['src/generated.ts', renderTs(data)],
        ['src/theme/builtin.generated.ts', renderBuiltinTs(data, slate)],
        ['docs/tokens.md', renderDocs(data)],
        [resolve(coreDir, 'src/styles/tokens.css'), renderCoreTokensCss(data, slate)],
        ...Object.keys(CORE_MODES).map(mode => [resolve(coreDir, `src/styles/themes/${mode}.css`), renderCoreModeCss(data, slate, mode)]),
      ]

  const stale = []

  for (const [path, content] of outputs) {
    const absolutePath = resolve(pkgDir, path)

    if (check) {
      const current = await readFile(absolutePath, 'utf8').catch(() => null)
      if (current !== content)
        stale.push(path)

      continue
    }

    await mkdir(dirname(absolutePath), { recursive: true })
    await writeFile(absolutePath, content, 'utf8')
  }

  if (check) {
    if (stale.length > 0) {
      console.error(`[tokens] расходятся с реестром и темами: ${stale.join(', ')}\nЗапусти \`yarn workspace @feugene/granularity-tokens generate\`.`)
      process.exitCode = 1
      return
    }

    console.log('[tokens] сгенерированные файлы актуальны')
    return
  }

  console.log(`[tokens] обновлено: ${outputs.map(([path]) => path).join(', ')}`)
}

await main()
