import { existsSync, readdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import { emitCss, prepareApp } from '@feugene/granum/node'
import { windEngine } from '@feugene/granum-engine-wind'
import { GR_BASE_THEME_ID, grThemeCatalog } from '@feugene/granularity-tokens'

/**
 * Снимок вычисленных значений токенов по каждой теме каталога — эталон для
 * переезда тем.
 *
 * Сверяется то, что видит компонент, а не то, что написано в CSS: при переезде
 * меняются файлы, селекторы и слои, и сравнивать их текст бессмысленно. CSS
 * собирает та же функция, что сборка приложения (`prepareApp` + `emitCss`
 * granum, пакет — из собранного `dist`), значения считает Chromium: jsdom не
 * подставляет `var()` в кастомных свойствах.
 *
 * Сверяются две вещи:
 * - `tokens` — значение каждого токена, объявленного слоями темы;
 * - `uses` — что получает компонент на каждом чтении `var(--gr-…)` из CSS
 *   компонентов и утилит и из JS компонентов: множество итоговых значений по
 *   токену. Так значение, которое компонент брал из своего фолбэка, а теперь
 *   берёт из темы, сверяется с прежним, хотя объявления раньше не было.
 *
 * Новый объявленный токен расхождением не считается, только если компонент
 * везде видел ровно это значение. Чтение, которое пропало или появилось, — не
 * расхождение: значения уже прочитанных токенов сверяет `uses`.
 *
 * Кроме сборки на granum сверяется CSS темы для подключения без granum —
 * `dist/themes/<id>.css` и, у базовой темы, `dist/styles/index.css` с
 * подставленными `@import`. В нём нет CSS компонентов, поэтому он сверяется по
 * своим токенам, а полнота проверяется отдельно: каждый токен слоёв темы granum
 * обязан там быть.
 *
 * Цветовое значение сверяется по итоговому цвету: пробник с `color: <значение>`
 * превращает `color-mix(…)` в конкретный цвет, и одинаковый цвет, записанный
 * другой формулой, расхождением не считается. Остальные — по тексту с
 * подставленными `var()` и единым пробелом после запятой.
 *
 *   node scripts/theme-values.mjs --write          записать снимок всех тем
 *   node scripts/theme-values.mjs --write-new      дописать снимок новых тем каталога, не трогая остальные
 *   node scripts/theme-values.mjs                  сверить, код 1 при расхождении
 *   node scripts/theme-values.mjs --allow <file>   ожидаемые расхождения: список `["<тема> <контекст> <токен>", …]`
 *                                                  или группы с причиной (`theme-values.allow.json`)
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BASELINE = fileURLToPath(new URL('./theme-values.baseline.json', import.meta.url))

/** Цвет-маркер: пробник, унаследовавший его, значит, что значение не цвет. */
const MARKER = 'rgb(1, 2, 3)'

/**
 * Страница каждого режима и остров другого режима: в режиме по умолчанию — все
 * остальные режимы, в остальных — режим по умолчанию. Значение читается на
 * элементе внутри контекста — там, где его видит компонент, а не где оно
 * объявлено. Без атрибута действует режим по умолчанию.
 */
function contextsOf(theme) {
  const pair = mode => `${theme.id}-${mode}`
  const others = theme.modes.map(mode => mode.name).filter(mode => mode !== theme.defaultMode)

  return [
    { name: `page-${theme.defaultMode}`, page: null, island: null },
    ...others.map(mode => ({ name: `page-${mode}`, page: pair(mode), island: null })),
    ...others.map(mode => ({ name: `island-${mode}-in-${theme.defaultMode}`, page: null, island: pair(mode) })),
    ...others.map(mode => ({ name: `island-${theme.defaultMode}-in-${mode}`, page: pair(mode), island: pair(theme.defaultMode) })),
  ]
}

async function buildGranumCss(theme) {
  const app = await prepareApp({
    engine: windEngine(),
    providers: ['@feugene/granularity'],
    components: 'all',
    // Тема — основная и единственная: её режим по умолчанию лежит под `:root`, как у приложения.
    themes: [{ theme: theme.id, modes: theme.modes.map(mode => mode.name) }],
    appSources: { dirs: [] },
    // Снимок — про значения темы, а не про обрезку: с обрезкой из сборки уходят
    // токены, которых не читает ни один компонент, и CSS для подключения без
    // granum, где они есть, сверять было бы не с чем.
    pruneTokens: { mode: 'off' },
  }, ROOT)
  const { css, layers } = await emitCss(app)

  return { css, themeTokens: declaredTokens(`${layers.tokens}\n${layers.themes}`) }
}

/** CSS с подставленными относительными `@import` — так его видит бандлер потребителя. */
async function readImportedCss(file) {
  const text = await readFile(file, 'utf8')
  const parts = await Promise.all(text.split(/(@import\s+'[^']+';)/).map(async (part) => {
    const target = /^@import\s+'([^']+)';$/.exec(part)?.[1]

    return target ? readImportedCss(resolve(dirname(file), target)) : part
  }))

  return parts.join('')
}

function declaredTokens(css) {
  return [...new Set([...css.matchAll(/(--gr-[\w-]+)\s*:/g)].map(match => match[1]))].sort()
}

/** Каждое `var(--gr-…)` текста целиком, со вложенными; выражение с подстановкой шаблона не считается. */
function varExpressions(text) {
  const found = new Set()
  for (const match of text.matchAll(/var\(--gr-/g)) {
    let depth = 0
    for (let i = match.index; i < text.length; i++) {
      if (text[i] === '(') {
        depth++
      }
      else if (text[i] === ')' && --depth === 0) {
        const expression = text.slice(match.index, i + 1)
        if (!/[$'"`\n]/.test(expression))
          found.add(expression)
        break
      }
    }
  }

  return found
}

/** Чтения в JS компонентов: классы утилит пишут пробел подчёркиванием. */
function jsExpressions() {
  const found = new Set()
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory())
        walk(path)
      else if (entry.name.endsWith('.js'))
        found.add(path)
    }
  }
  for (const dir of ['dist/components', 'dist/chunks'].map(dir => join(ROOT, dir)).filter(existsSync))
    walk(dir)

  return Promise.all([...found].map(file => readFile(file, 'utf8')))
    .then(texts => new Set(texts.flatMap(text => [...varExpressions(text)].map(expression => expression.replaceAll('_', ' ')))))
}

async function measure(css, tokens, expressions, contexts) {
  const browser = await chromium.launch()

  try {
    const page = await browser.newPage()
    await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body></body></html>`)

    const out = {}
    for (const context of contexts) {
      out[context.name] = await page.evaluate(({ context, tokens, expressions, marker }) => {
        const html = document.documentElement
        if (context.page)
          html.setAttribute('data-theme', context.page)
        else
          html.removeAttribute('data-theme')

        document.body.innerHTML = '<div id="island"><div id="target"><span id="probe"></span></div></div>'
        const island = document.getElementById('island')
        if (context.island)
          island.setAttribute('data-theme', context.island)

        const target = document.getElementById('target')
        const probe = document.getElementById('probe')
        target.style.color = marker

        const resolveValue = (expression) => {
          target.style.setProperty('--gr-probe-value', expression)
          const value = getComputedStyle(target).getPropertyValue('--gr-probe-value').trim()
          probe.style.color = expression
          const color = getComputedStyle(probe).color
          return color === marker ? { value } : { value, color }
        }

        const values = {}
        for (const token of tokens)
          values[token] = resolveValue(`var(${token})`)

        const uses = {}
        for (const expression of expressions) {
          const token = /^var\((--gr-[\w-]+)/.exec(expression)[1]
          const found = resolveValue(expression)
          ;(uses[token] ??= new Set()).add(found.color ?? found.value)
        }
        target.style.removeProperty('--gr-probe-value')

        return {
          colorScheme: getComputedStyle(target).colorScheme,
          tokens: values,
          uses: Object.fromEntries(Object.entries(uses).sort(([a], [b]) => (a < b ? -1 : 1)).map(([token, set]) => [token, [...set].sort()])),
        }
      }, { context, tokens, expressions: [...expressions].sort(), marker: MARKER })
    }

    return out
  }
  finally {
    await browser.close()
  }
}

/**
 * Пробелы вокруг запятой и ведущий ноль смысла не несут: минифицированный CSS
 * пишет `rgba(0,0,0,.25)`, JSON темы — `rgba(0, 0, 0, 0.25)`. Приводится и
 * эталон: он мог быть записан до правила.
 */
function normalized(value) {
  return value.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').replace(/(^|[\s,(-])\.(\d)/g, '$10.$2')
}

function normalizeSnapshot(contexts) {
  for (const context of Object.values(contexts)) {
    for (const found of Object.values(context.tokens))
      found.value = normalized(found.value)
    for (const [token, values] of Object.entries(context.uses ?? {}))
      context.uses[token] = [...new Set(values.map(normalized))].sort()
  }
  return contexts
}

/** Новый объявленный токен законен, если компонент везде видел ровно это значение. */
function sameAsUses(expected, token, now) {
  const seen = expected.uses?.[token]
  return seen?.length === 1 && seen[0] === (now.color ?? now.value)
}

function differences(theme, baseline, current) {
  const found = []

  for (const [name, expected] of Object.entries(baseline)) {
    const key = text => `${theme} ${name} ${text}`
    const actual = current[name]
    if (!actual) {
      found.push({ key: key('*'), text: 'контекст пропал' })
      continue
    }

    if (actual.colorScheme !== expected.colorScheme)
      found.push({ key: key('color-scheme'), text: `${expected.colorScheme} → ${actual.colorScheme}` })

    for (const [token, was] of Object.entries(expected.tokens)) {
      const now = actual.tokens[token]
      if (!now) {
        found.push({ key: key(token), text: 'токен пропал' })
        continue
      }

      const changed = was.color && now.color ? was.color !== now.color : was.value !== now.value
      if (!changed)
        continue
      // Пустое значение — токен объявлял только CSS компонента у себя внутри: для темы он новый.
      if (was.value === '' && !was.color) {
        if (!sameAsUses(expected, token, now))
          found.push({ key: key(token), text: `новый токен ${now.color ?? now.value}; компонент видел ${JSON.stringify(expected.uses?.[token] ?? [])}` })
        continue
      }
      found.push({ key: key(token), text: `${was.color ?? was.value} → ${now.color ?? now.value}` })
    }

    for (const [token, now] of Object.entries(actual.tokens).filter(([token]) => !(token in expected.tokens))) {
      if (!sameAsUses(expected, token, now))
        found.push({ key: key(token), text: `новый токен ${now.color ?? now.value}; компонент видел ${JSON.stringify(expected.uses?.[token] ?? [])}` })
    }

    for (const [token, was] of Object.entries(expected.uses ?? {})) {
      const now = actual.uses?.[token]
      if (now && JSON.stringify(now) !== JSON.stringify(was))
        found.push({ key: key(`uses ${token}`), text: `${was.join(' | ')} → ${now.join(' | ')}` })
    }
  }

  return found
}

/** Список `["<тема> <контекст> <токен>", …]` либо группы `{ "<дефект>": { why, keys } }` — причина рядом с ключами. */
async function readAllowList(args) {
  const index = args.indexOf('--allow')
  if (index === -1)
    return new Set()

  const list = JSON.parse(await readFile(args[index + 1], 'utf8'))

  return new Set(Array.isArray(list) ? list : Object.values(list).flatMap(group => group.keys))
}

/** Срез снимка по токенам: CSS без granum сверяется только по тому, что в нём объявлено. */
function pick(contexts, tokens) {
  const keep = new Set(tokens)

  return Object.fromEntries(Object.entries(contexts).map(([name, context]) => [name, {
    ...context,
    tokens: Object.fromEntries(Object.entries(context.tokens).filter(([token]) => keep.has(token))),
  }]))
}

const used = new Set()

function report(label, found, allowed) {
  const unexpected = found.filter(item => !allowed.has(item.key))
  for (const item of found.filter(item => allowed.has(item.key))) {
    used.add(item.key)
    console.log(`[theme-values] ${label} ожидаемо  ${item.key}: ${item.text}`)
  }
  for (const item of unexpected)
    console.error(`[theme-values] ${label} РАСХОЖДЕНИЕ ${item.key}: ${item.text}`)

  if (unexpected.length > 0) {
    console.error(`[theme-values] ${label}: ${unexpected.length} расхождений`)
    return false
  }

  console.log(`[theme-values] ${label}: совпадает со снимком (${found.length} ожидаемых расхождений)`)
  return true
}

const args = process.argv.slice(2)
const fromJs = await jsExpressions()
const current = {}
const builds = {}
for (const theme of grThemeCatalog) {
  const granum = await buildGranumCss(theme)
  builds[theme.id] = granum
  current[theme.id] = normalizeSnapshot(await measure(granum.css, declaredTokens(granum.css), new Set([...varExpressions(granum.css), ...fromJs]), contextsOf(theme)))
}

if (args.includes('--write')) {
  await writeFile(BASELINE, `${JSON.stringify({ themes: current }, null, 2)}\n`)
  for (const theme of grThemeCatalog) {
    const contexts = Object.values(current[theme.id])
    console.log(`[theme-values] ${theme.id}: ${contexts.length} контекста × ${Object.keys(contexts[0].tokens).length} токенов, ${Object.keys(contexts[0].uses).length} читаемых`)
  }
  process.exit(0)
}

const stored = JSON.parse(await readFile(BASELINE, 'utf8')).themes

if (args.includes('--write-new')) {
  const added = grThemeCatalog.filter(theme => !stored[theme.id])
  for (const theme of added)
    stored[theme.id] = current[theme.id]
  await writeFile(BASELINE, `${JSON.stringify({ themes: Object.fromEntries(Object.entries(stored).sort(([a], [b]) => (a < b ? -1 : 1))) }, null, 2)}\n`)
  console.log(`[theme-values] снимок дописан: ${added.map(theme => theme.id).join(', ') || 'новых тем нет'}`)
  process.exit(0)
}

const baseline = Object.fromEntries(Object.entries(stored).map(([id, contexts]) => [id, normalizeSnapshot(contexts)]))
const allowed = await readAllowList(args)
let ok = true

for (const id of Object.keys(baseline).filter(id => !(id in current))) {
  console.error(`[theme-values] темы ${id} нет в каталоге, а снимок её помнит`)
  ok = false
}

for (const theme of grThemeCatalog) {
  if (!baseline[theme.id]) {
    console.error(`[theme-values] ${theme.id}: снимка нет — запишите его до первой правки значений (--write-new)`)
    ok = false
    continue
  }
  ok = report(`${theme.id} granum`, differences(theme.id, baseline[theme.id], current[theme.id]), allowed) && ok

  const standalone = [join(ROOT, `dist/themes/${theme.id}.css`)]
  if (theme.id === GR_BASE_THEME_ID)
    standalone.push(join(ROOT, 'dist/styles/index.css'))
  for (const file of standalone) {
    const label = `${theme.id} ${file.slice(ROOT.length)}`
    const css = await readImportedCss(file)
    const tokens = declaredTokens(css)
    const measured = normalizeSnapshot(await measure(css, tokens, new Set(), contextsOf(theme)))
    const expected = pick(baseline[theme.id], tokens)
    ok = report(label, differences(theme.id, expected, measured).filter(item => !item.key.includes(' uses ')), allowed) && ok
    for (const token of builds[theme.id].themeTokens.filter(token => !tokens.includes(token))) {
      console.error(`[theme-values] ${label}: нет токена темы ${token}`)
      ok = false
    }
  }
}

for (const key of [...allowed].filter(key => !used.has(key))) {
  console.error(`[theme-values] исключение не сработало: ${key}`)
  ok = false
}

if (!ok)
  process.exit(1)
