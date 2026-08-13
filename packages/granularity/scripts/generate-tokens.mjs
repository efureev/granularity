import { existsSync } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { mixSrgb } from '../src/theme/color.ts'

/**
 * Генерация токенов из данных.
 *
 * Единственный источник истины — JSON в `tokens/`:
 *   tokens/foundation.json   — примитивы (палитра, типографика, spacing, радиусы, тени, motion, z-index);
 *   tokens/derived.json      — производные формулы hover/active (декларативно: base + amount + mixWith);
 *   tokens/themes/*.json     — семантические роли темы.
 *
 * Плюс покомпонентный контракт — `src/components/GrX/tokens.json` рядом с кодом
 * компонента (и `src/composables/tokens.json` для того, что ставит композабл).
 * CSS из него не генерируется: `hook`-токены обязаны остаться неприсвоенными,
 * иначе `var(--gr-x, дефолт)` перестанет падать на дефолт, а `inline` и `css`
 * присваивает сам компонент. Реестр нужен для доки и для гейта
 * `src/__tests__/componentTokens.test.ts`.
 *
 * Отсюда генерируются:
 *   src/styles/tokens.css            — примитивы + `color-mix`-формулы;
 *   src/styles/themes/{light,dark}.css — роли + блок `@supports not (color-mix)` с ВЫЧИСЛЕННЫМИ фолбэками;
 *   src/tokens/generated.ts          — те же данные для TS-потребителей (витрина строит из них справочник);
 *   docs/tokens.md                   — справочник токенов.
 *
 * Зачем: фолбэки `@supports` раньше поддерживались руками — 40 хексов, которые
 * обязаны совпадать с результатом `color-mix` до байта, и ничто этого не проверяло.
 * Теперь они считаются той же формулой, что стоит в CSS.
 *
 * Запуск: `yarn generate:tokens` (перезаписывает), `--check` — только проверка
 * расхождения (используется тестом `src/__tests__/tokens.generated.test.ts`).
 */

const pkgDir = fileURLToPath(new URL('..', import.meta.url))
const tokensDir = resolve(pkgDir, 'tokens')

const GENERATED_BANNER_CSS = [
  '/*',
  ' * СГЕНЕРИРОВАНО `yarn generate:tokens` из `tokens/*.json` — правки здесь потеряются.',
  ' * Менять значения и комментарии нужно в JSON, затем перегенерировать.',
  ' */',
].join('\n')

const GENERATED_BANNER_TS
  = '// СГЕНЕРИРОВАНО `yarn generate:tokens` из `tokens/*.json` — правки здесь потеряются.'

// --- цвет ------------------------------------------------------------------

// Математика общая с `extendTheme` и гейтами контраста — расходиться ей нельзя.
// Отсюда и запуск скрипта: `node --experimental-strip-types` (см. package.json).

// --- чтение данных ---------------------------------------------------------

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

/**
 * Реестры покомпонентных токенов. Владелец берётся из файловой системы, как и
 * состав компонентов в `generate-registry.mjs`: новый компонент приносит свой
 * `tokens.json` сам, править общий список не нужно.
 */
async function readComponentRegistries() {
  const componentsDir = resolve(pkgDir, 'src/components')
  const entries = await readdir(componentsDir, { withFileTypes: true })

  const paths = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map(entry => resolve(componentsDir, entry.name, 'tokens.json'))
    .concat([resolve(pkgDir, 'src/composables/tokens.json')])
    .filter(path => existsSync(path))

  const registries = await Promise.all(paths.map(readJson))

  // Компоненты по алфавиту, владельцы вне `src/components` — после них.
  const rank = owner => (owner.startsWith('Gr') ? 0 : 1)

  return registries.sort((left, right) =>
    rank(left.owner) - rank(right.owner) || left.owner.localeCompare(right.owner))
}

async function readTokenData() {
  const [foundation, derived, light, dark, components] = await Promise.all([
    readJson(resolve(tokensDir, 'foundation.json')),
    readJson(resolve(tokensDir, 'derived.json')),
    readJson(resolve(tokensDir, 'themes/light.json')),
    readJson(resolve(tokensDir, 'themes/dark.json')),
    readComponentRegistries(),
  ])

  return { foundation, derived, themes: [light, dark], components }
}

function flattenTokens(groups) {
  return groups.flatMap(group => group.tokens.map(token => ({ ...token, section: group.title })))
}

function themeValueOf(theme, name) {
  const token = flattenTokens(theme.groups).find(item => item.name === name)
  if (!token)
    throw new Error(`тема "${theme.name}" не объявляет ${name}, а он нужен для производной формулы`)

  return token.value
}

// --- CSS -------------------------------------------------------------------

function renderNote(note, indent) {
  const lines = note.split('\n')
  if (lines.length === 1)
    return [`${indent}/* ${lines[0]} */`]

  return [`${indent}/*`, ...lines.map(line => `${indent} * ${line}`.trimEnd()), `${indent} */`]
}

function renderGroup(group, indent) {
  // Заголовок группы и её обоснование — один комментарий, а не два подряд.
  const lines = group.note
    ? renderNote(`${group.title}\n\n${group.note}`, indent)
    : [`${indent}/* ${group.title} */`]

  for (const token of group.tokens) {
    if (token.note)
      lines.push(...renderNote(token.note, indent))

    lines.push(`${indent}${token.name}: ${token.value};`)
  }

  return lines
}

function renderTokensCss({ foundation, derived }) {
  const lines = [GENERATED_BANNER_CSS, ':root {']

  for (const [index, group] of foundation.groups.entries()) {
    if (index > 0)
      lines.push('')

    lines.push(...renderGroup(group, '  '))
  }

  for (const group of derived.groups) {
    lines.push('', `  /* ${group.title} */`)

    for (const token of group.tokens)
      lines.push(`  ${token.name}: color-mix(in srgb, var(${token.base}) ${token.amount}%, var(${token.mixWith}));`)
  }

  lines.push('}', '')

  return lines.join('\n')
}

function renderThemeCss(theme, derived) {
  const selector = theme.selectors.join(',\n')
  const lines = [GENERATED_BANNER_CSS]

  if (theme.note)
    lines.push(...renderNote(theme.note, ''))

  lines.push(`${selector} {`)

  for (const [index, group] of theme.groups.entries()) {
    if (index > 0)
      lines.push('')

    lines.push(...renderGroup(group, '  '))
  }

  lines.push('}', '')

  // Фолбэк для браузеров без `color-mix`: та же формула, посчитанная заранее.
  lines.push('@supports not (color: color-mix(in srgb, #000 50%, #fff)) {')
  lines.push(`${theme.selectors.map(item => `  ${item}`).join(',\n')} {`)

  for (const [index, group] of derived.groups.entries()) {
    if (index > 0)
      lines.push('')

    lines.push(`    /* ${group.fallbackTitle} */`)

    for (const token of group.tokens) {
      const value = mixSrgb(
        themeValueOf(theme, token.base),
        themeValueOf(theme, token.mixWith),
        token.amount,
      )

      lines.push(`    ${token.name}: ${value};`)
    }
  }

  lines.push('  }', '}', '')

  return lines.join('\n')
}

// --- TS --------------------------------------------------------------------

function renderTs({ foundation, derived, themes, components }) {
  const foundationTokens = flattenTokens(foundation.groups).map(token => ({
    name: token.name,
    value: token.value,
    section: token.section,
    description: token.description,
  }))

  const derivedTokens = derived.groups.flatMap(group => group.tokens.map(token => ({
    name: token.name,
    section: group.title,
    description: token.description,
    formula: `color-mix(in srgb, var(${token.base}) ${token.amount}%, var(${token.mixWith}))`,
    base: token.base,
    amount: token.amount,
    mixWith: token.mixWith,
    values: Object.fromEntries(themes.map(theme => [
      theme.name,
      mixSrgb(themeValueOf(theme, token.base), themeValueOf(theme, token.mixWith), token.amount),
    ])),
  })))

  const themeTokenNames = [...new Set(themes.flatMap(theme => flattenTokens(theme.groups).map(token => token.name)))]

  const themeTokens = themeTokenNames.map((name) => {
    const source = flattenTokens(themes[0].groups).find(token => token.name === name)
      ?? flattenTokens(themes.find(theme => flattenTokens(theme.groups).some(token => token.name === name)).groups)
        .find(token => token.name === name)

    return {
      name,
      section: source.section,
      description: source.description,
      values: Object.fromEntries(themes.map(theme => [theme.name, themeValueOf(theme, name)])),
    }
  })

  const literal = value => JSON.stringify(value, null, 2)

  const componentTokens = components.flatMap(registry => registry.tokens.map(token => ({
    owner: registry.owner,
    name: token.name,
    kind: token.kind,
    default: token.default,
    description: token.description,
  })))

  return [
    GENERATED_BANNER_TS,
    '',
    "import type { GrComponentToken, GrDerivedToken, GrFoundationToken, GrThemeToken } from './types'",
    '',
    `export const grThemeNames = ${literal(themes.map(theme => theme.name))} as const`,
    '',
    `export const grFoundationTokens: GrFoundationToken[] = ${literal(foundationTokens)}`,
    '',
    `export const grDerivedTokens: GrDerivedToken[] = ${literal(derivedTokens)}`,
    '',
    `export const grThemeTokens: GrThemeToken[] = ${literal(themeTokens)}`,
    '',
    `export const grComponentTokens: GrComponentToken[] = ${literal(componentTokens)}`,
    '',
  ].join('\n')
}

// --- docs ------------------------------------------------------------------

const COMPONENT_KIND_LABEL = {
  theme: 'тема компонента',
  css: 'CSS компонента',
  inline: 'инлайн-стиль',
  hook: 'только хук',
}

function renderComponentDocs(components) {
  const lines = [
    '## Покомпонентные точки кастомизации',
    '',
    'Переменные, которыми перекрашивается и перемеряется отдельный компонент.',
    'Источник — `tokens.json` рядом с кодом компонента; гейт полноты —',
    '`src/__tests__/componentTokens.test.ts`. Это публичный контракт: имена',
    'меняются так же, как имена пропов, — с записью в `CHANGELOG.md`.',
    '',
    'Колонка «откуда» отвечает на вопрос, что произойдёт, если токен не задать:',
    '',
    '| Значение | Что это значит |',
    '| --- | --- |',
    '| тема компонента | объявлен в `components/<Gr…>/themes/*.css`, переключается вместе с темой |',
    '| CSS компонента | объявлен в собственном `<style>` компонента |',
    '| инлайн-стиль | компонент присваивает его сам, обычно от ступени `size` |',
    '| только хук | нигде не присваивается: работает дефолт из `var(--gr-x, дефолт)` |',
    '',
  ]

  for (const registry of components) {
    lines.push(`### ${registry.owner}`, '')
    lines.push('| Токен | Откуда | По умолчанию | Назначение |', '| --- | --- | --- | --- |')

    for (const token of registry.tokens) {
      const kind = COMPONENT_KIND_LABEL[token.kind] ?? token.kind
      lines.push(`| \`${token.name}\` | ${kind} | ${token.default} | ${token.description} |`)
    }

    lines.push('')
  }

  return lines
}

function renderDocs({ foundation, derived, themes, components }) {
  const lines = [
    '<!-- СГЕНЕРИРОВАНО `yarn generate:tokens` из `tokens/*.json` — правки здесь потеряются. -->',
    '',
    '# Токены дизайн-системы',
    '',
    'Источник истины — `tokens/*.json` в пакете. Из них генерируются `src/styles/tokens.css`,',
    '`src/styles/themes/*.css`, TS-справочник `@feugene/granularity/tokens` и этот документ.',
    'Правка CSS руками бессмысленна: следующая генерация её затрёт.',
    '',
    '## Примитивы',
    '',
    'Не зависят от темы, живут в `:root`.',
    '',
  ]

  for (const group of foundation.groups) {
    lines.push(`### ${group.title}`, '')

    if (group.note)
      lines.push(...group.note.split('\n'), '')

    lines.push('| Токен | Значение | Назначение |', '| --- | --- | --- |')

    for (const token of group.tokens)
      lines.push(`| \`${token.name}\` | \`${token.value}\` | ${token.description} |`)

    lines.push('')
  }

  lines.push(
    '## Семантические роли по темам',
    '',
    'Переключаются селектором темы. Значения выверены по контрасту — см. примечания.',
    '',
  )

  const sections = [...new Set(themes.flatMap(theme => theme.groups.map(group => group.title)))]

  for (const section of sections) {
    lines.push(`### ${section}`, '')
    lines.push(`| Токен | ${themes.map(theme => theme.name).join(' | ')} | Назначение |`)
    lines.push(`| --- | ${themes.map(() => '---').join(' | ')} | --- |`)

    const names = [...new Set(themes.flatMap(theme =>
      theme.groups.filter(group => group.title === section).flatMap(group => group.tokens.map(token => token.name)),
    ))]

    for (const name of names) {
      const source = themes
        .flatMap(theme => flattenTokens(theme.groups))
        .find(token => token.name === name)

      const values = themes.map(theme => `\`${themeValueOf(theme, name)}\``).join(' | ')
      lines.push(`| \`${name}\` | ${values} | ${source.description ?? ''} |`)
    }

    lines.push('')

    const notes = themes.flatMap(theme => flattenTokens(theme.groups)
      .filter(token => token.note && names.includes(token.name))
      .map(token => ({ theme: theme.name, token })))

    for (const { theme, token } of notes)
      lines.push(`> **\`${token.name}\` (${theme}).** ${token.note.split('\n').join(' ')}`, '')
  }

  lines.push(
    '## Производные состояния',
    '',
    'Объявлены формулой `color-mix`; для браузеров без её поддержки генератор',
    'вычисляет тот же результат заранее и кладёт в блок `@supports not (color-mix)`.',
    '',
    `| Токен | Формула | ${themes.map(theme => `${theme.name} (fallback)`).join(' | ')} | Назначение |`,
    `| --- | --- | ${themes.map(() => '---').join(' | ')} | --- |`,
  )

  for (const group of derived.groups) {
    for (const token of group.tokens) {
      const values = themes
        .map(theme => `\`${mixSrgb(themeValueOf(theme, token.base), themeValueOf(theme, token.mixWith), token.amount)}\``)
        .join(' | ')

      lines.push(
        `| \`${token.name}\` | \`${token.amount}% ${token.base}\` + \`${token.mixWith}\` | ${values} | ${token.description} |`,
      )
    }
  }

  lines.push('', ...renderComponentDocs(components))

  return lines.join('\n')
}

// --- запись ----------------------------------------------------------------

async function main() {
  const check = process.argv.includes('--check')
  const data = await readTokenData()

  const outputs = [
    ['src/styles/tokens.css', renderTokensCss(data)],
    ...data.themes.map(theme => [`src/styles/themes/${theme.name}.css`, renderThemeCss(theme, data.derived)]),
    ['src/tokens/generated.ts', renderTs(data)],
    ['docs/tokens.md', renderDocs(data)],
  ]

  const stale = []

  for (const [relativePath, content] of outputs) {
    const absolutePath = resolve(pkgDir, relativePath)

    if (check) {
      const current = await readFile(absolutePath, 'utf8').catch(() => null)
      if (current !== content)
        stale.push(relativePath)

      continue
    }

    await writeFile(absolutePath, content, 'utf8')
  }

  if (check) {
    if (stale.length > 0) {
      console.error(`[tokens] расходятся с \`tokens/*.json\`: ${stale.join(', ')}\nЗапусти \`yarn generate:tokens\`.`)
      process.exitCode = 1
      return
    }

    console.log('[tokens] сгенерированные файлы актуальны')
    return
  }

  console.log(`[tokens] обновлено: ${outputs.map(([path]) => path).join(', ')}`)
}

await main()
