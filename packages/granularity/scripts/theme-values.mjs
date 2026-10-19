import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import { emitCss, prepareApp } from '@feugene/granum/node'
import { windEngine } from '@feugene/granum-engine-wind'

/**
 * Снимок вычисленных значений токенов — эталон для переезда тем.
 *
 * Сверяется то, что видит компонент, а не то, что написано в CSS: при переезде
 * меняются файлы, селекторы и слои, и сравнивать их текст бессмысленно. CSS
 * собирает та же функция, что сборка приложения (`prepareApp` + `emitCss`
 * granum, пакет — из собранного `dist`), значения считает Chromium: jsdom не
 * подставляет `var()` в кастомных свойствах.
 *
 * Сверяются два пути к теме: сборка приложения на granum и `styles.css` пакета
 * для подключения без granum (`dist/styles/index.css` с подставленными
 * `@import`). У второго токенов меньше — в нём нет CSS компонентов и утилит, —
 * поэтому он сверяется по своим токенам, а полнота темы в нём проверяется
 * отдельно: каждый токен слоёв темы granum обязан там быть.
 *
 * Цветовой токен сверяется по итоговому цвету: пробник с `color: var(--x)`
 * превращает `color-mix(…)` в конкретный цвет, и одинаковый цвет, записанный
 * другой формулой, расхождением не считается. Остальные токены — по тексту с
 * подставленными `var()`.
 *
 *   node scripts/theme-values.mjs --write          записать снимок
 *   node scripts/theme-values.mjs                  сверить, код 1 при расхождении
 *   node scripts/theme-values.mjs --allow <file>   ожидаемые расхождения: список `["<контекст> <токен>", …]`
 *                                                  или группы с причиной (`theme-values.allow.json`)
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BASELINE = fileURLToPath(new URL('./theme-values.baseline.json', import.meta.url))

/**
 * Страница режима и остров другого режима внутри неё. Значение читается на
 * элементе внутри контекста — там, где его видит компонент, а не где оно
 * объявлено. Режим включается парой `<тема>-<режим>`; без атрибута действует
 * режим по умолчанию.
 */
const CONTEXTS = [
  { name: 'page-light', page: null, island: null },
  { name: 'page-dark', page: 'slate-dark', island: null },
  { name: 'island-dark-in-light', page: null, island: 'slate-dark' },
  { name: 'island-light-in-dark', page: 'slate-dark', island: 'slate-light' },
]

/** Цвет-маркер: пробник, унаследовавший его, значит, что значение токена не цвет. */
const MARKER = 'rgb(1, 2, 3)'

async function buildGranumCss() {
  const app = await prepareApp({
    engine: windEngine(),
    providers: ['@feugene/granularity'],
    components: 'all',
    appSources: { dirs: [] },
  }, ROOT)
  const { css, layers } = await emitCss(app)

  return { css, themeTokens: declaredTokens(`${layers.tokens}\n${layers.themes}`) }
}

/** `styles.css` пакета с подставленными относительными `@import` — так его видит бандлер потребителя. */
async function readStylesCss(file = resolve(ROOT, 'dist/styles/index.css')) {
  const text = await readFile(file, 'utf8')
  const parts = await Promise.all(text.split(/(@import\s+'[^']+';)/).map(async (part) => {
    const target = /^@import\s+'([^']+)';$/.exec(part)?.[1]

    return target ? readStylesCss(resolve(dirname(file), target)) : part
  }))

  return parts.join('')
}

function declaredTokens(css) {
  return [...new Set([...css.matchAll(/(--gr-[\w-]+)\s*:/g)].map(match => match[1]))].sort()
}

async function measure(css, tokens = declaredTokens(css)) {
  const browser = await chromium.launch()

  try {
    const page = await browser.newPage()
    await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body></body></html>`)

    const contexts = {}
    for (const context of CONTEXTS) {
      contexts[context.name] = await page.evaluate(({ context, tokens, marker }) => {
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

        const style = getComputedStyle(target)
        const values = {}
        for (const token of tokens) {
          const value = style.getPropertyValue(token).trim().replace(/\s+/g, ' ')
          probe.style.color = `var(${token})`
          const color = getComputedStyle(probe).color
          values[token] = color === marker ? { value } : { value, color }
        }

        return { colorScheme: style.colorScheme, tokens: values }
      }, { context, tokens, marker: MARKER })
    }

    return { contexts }
  }
  finally {
    await browser.close()
  }
}

function differences(baseline, current) {
  const found = []

  for (const [name, expected] of Object.entries(baseline.contexts)) {
    const actual = current.contexts[name]
    if (!actual) {
      found.push({ key: `${name} *`, text: 'контекст пропал' })
      continue
    }

    if (actual.colorScheme !== expected.colorScheme)
      found.push({ key: `${name} color-scheme`, text: `${expected.colorScheme} → ${actual.colorScheme}` })

    for (const [token, was] of Object.entries(expected.tokens)) {
      const now = actual.tokens[token]
      if (!now) {
        found.push({ key: `${name} ${token}`, text: 'токен пропал' })
        continue
      }

      const changed = was.color && now.color ? was.color !== now.color : was.value !== now.value
      if (changed)
        found.push({ key: `${name} ${token}`, text: `${was.color ?? was.value} → ${now.color ?? now.value}` })
    }

    for (const token of Object.keys(actual.tokens).filter(token => !(token in expected.tokens)))
      found.push({ key: `${name} ${token}`, text: 'новый токен' })
  }

  return found
}

/** Список `["<контекст> <токен>", …]` либо группы `{ "<дефект>": { why, keys } }` — причина рядом с ключами. */
async function readAllowList(args) {
  const index = args.indexOf('--allow')
  if (index === -1)
    return new Set()

  const list = JSON.parse(await readFile(args[index + 1], 'utf8'))

  return new Set(Array.isArray(list) ? list : Object.values(list).flatMap(group => group.keys))
}

/** Срез снимка по токенам: `styles.css` сверяется только по тому, что в нём объявлено. */
function pick(snapshot, tokens) {
  const keep = new Set(tokens)

  return {
    contexts: Object.fromEntries(Object.entries(snapshot.contexts).map(([name, context]) => [name, {
      ...context,
      tokens: Object.fromEntries(Object.entries(context.tokens).filter(([token]) => keep.has(token))),
    }])),
  }
}

function report(label, found, allowed) {
  const unexpected = found.filter(item => !allowed.has(item.key))
  const stale = [...allowed].filter(key => !found.some(item => item.key === key))

  for (const item of found.filter(item => allowed.has(item.key)))
    console.log(`[theme-values] ${label} ожидаемо  ${item.key}: ${item.text}`)
  for (const item of unexpected)
    console.error(`[theme-values] ${label} РАСХОЖДЕНИЕ ${item.key}: ${item.text}`)
  for (const key of stale)
    console.error(`[theme-values] ${label} исключение не сработало: ${key}`)

  if (unexpected.length > 0 || stale.length > 0) {
    console.error(`[theme-values] ${label}: ${unexpected.length} расхождений, ${stale.length} лишних исключений`)
    return false
  }

  console.log(`[theme-values] ${label}: совпадает со снимком (${found.length} ожидаемых расхождений)`)
  return true
}

const args = process.argv.slice(2)
const granum = await buildGranumCss()
const current = await measure(granum.css)

if (args.includes('--write')) {
  await writeFile(BASELINE, `${JSON.stringify(current, null, 2)}\n`)
  const tokens = Object.keys(current.contexts['page-light'].tokens).length
  console.log(`[theme-values] снимок записан: ${CONTEXTS.length} контекста × ${tokens} токенов`)
  process.exit(0)
}

const baseline = JSON.parse(await readFile(BASELINE, 'utf8'))
const allowed = await readAllowList(args)

const stylesCss = await readStylesCss()
const stylesTokens = declaredTokens(stylesCss)
const lostInStyles = granum.themeTokens.filter(token => !stylesTokens.includes(token))
const styles = await measure(stylesCss, stylesTokens)

const granumOk = report('granum', differences(baseline, current), allowed)
const stylesOk = report('styles.css', differences(pick(baseline, stylesTokens), styles), allowed)
for (const token of lostInStyles)
  console.error(`[theme-values] styles.css: нет токена темы ${token}`)

if (!granumOk || !stylesOk || lostInStyles.length > 0)
  process.exit(1)
