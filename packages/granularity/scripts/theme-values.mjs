import { readFile, writeFile } from 'node:fs/promises'
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
 * Цветовой токен сверяется по итоговому цвету: пробник с `color: var(--x)`
 * превращает `color-mix(…)` в конкретный цвет, и одинаковый цвет, записанный
 * другой формулой, расхождением не считается. Остальные токены — по тексту с
 * подставленными `var()`.
 *
 *   node scripts/theme-values.mjs --write          записать снимок
 *   node scripts/theme-values.mjs                  сверить, код 1 при расхождении
 *   node scripts/theme-values.mjs --allow <file>   JSON-список ожидаемых расхождений
 *                                                  `["<контекст> <токен>", …]`
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BASELINE = fileURLToPath(new URL('./theme-values.baseline.json', import.meta.url))

/**
 * Страница темы и остров другой темы внутри неё. Значение читается на элементе
 * внутри контекста — там, где его видит компонент, а не где оно объявлено.
 */
const CONTEXTS = [
  { name: 'page-light', page: null, island: null },
  { name: 'page-dark', page: 'dark', island: null },
  { name: 'island-dark-in-light', page: null, island: 'dark' },
  { name: 'island-light-in-dark', page: 'dark', island: 'light' },
]

/** Цвет-маркер: пробник, унаследовавший его, значит, что значение токена не цвет. */
const MARKER = 'rgb(1, 2, 3)'

async function buildCss() {
  const app = await prepareApp({
    engine: windEngine(),
    providers: ['@feugene/granularity'],
    components: 'all',
    themes: { names: ['light', 'dark'] },
    appSources: { dirs: [] },
  }, ROOT)

  return (await emitCss(app)).css
}

function declaredTokens(css) {
  return [...new Set([...css.matchAll(/(--gr-[\w-]+)\s*:/g)].map(match => match[1]))].sort()
}

async function measure(css) {
  const tokens = declaredTokens(css)
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

async function readAllowList(args) {
  const index = args.indexOf('--allow')
  if (index === -1)
    return new Set()

  return new Set(JSON.parse(await readFile(args[index + 1], 'utf8')))
}

const args = process.argv.slice(2)
const current = await measure(await buildCss())

if (args.includes('--write')) {
  await writeFile(BASELINE, `${JSON.stringify(current, null, 2)}\n`)
  const tokens = Object.keys(current.contexts['page-light'].tokens).length
  console.log(`[theme-values] снимок записан: ${CONTEXTS.length} контекста × ${tokens} токенов`)
  process.exit(0)
}

const baseline = JSON.parse(await readFile(BASELINE, 'utf8'))
const allowed = await readAllowList(args)
const found = differences(baseline, current)
const unexpected = found.filter(item => !allowed.has(item.key))
const stale = [...allowed].filter(key => !found.some(item => item.key === key))

for (const item of found.filter(item => allowed.has(item.key)))
  console.log(`[theme-values] ожидаемо  ${item.key}: ${item.text}`)
for (const item of unexpected)
  console.error(`[theme-values] РАСХОЖДЕНИЕ ${item.key}: ${item.text}`)
for (const key of stale)
  console.error(`[theme-values] исключение не сработало: ${key}`)

if (unexpected.length > 0 || stale.length > 0) {
  console.error(`[theme-values] ${unexpected.length} расхождений, ${stale.length} лишних исключений`)
  process.exit(1)
}

console.log(`[theme-values] совпадает со снимком (${found.length} ожидаемых расхождений)`)
