import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * Гейт на состав локалей в собранной витрине.
 *
 * Переключатель предлагает два языка, а пакеты экосистемы везут три. Лишний язык
 * попадает в `dist` отдельным ленивым чанком — его никто не запрашивает, и на
 * странице потеря не видна вовсе: заметить её можно только пересчитав файлы.
 * Поэтому нужна проверка, а не внимательность.
 *
 * Место выбрано по источнику дефекта: сами пакеты tree-shaking не ломают —
 * проверено сборкой. Ломает его потребитель, импортирующий агрегат.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')
const packagesDir = resolve(root, '../../packages')

/**
 * Языки переключателя — источник правды.
 *
 * Читаются из самого переключателя, а не дублируются здесь: копия списка — ещё один
 * ручной реестр, и расходится он с приложением так же незаметно, как сам состав
 * импортов.
 */
function switcherLocales() {
  const source = readFileSync(resolve(root, 'src/components/layout/ShowcaseLocaleSwitcher.vue'), 'utf8')
  const block = source.match(/const localeOptions = \[(.*?)\]/s)
  if (!block)
    fail('не найден `localeOptions` в ShowcaseLocaleSwitcher.vue — проверка ослепла, а не прошла')

  const locales = [...block[1].matchAll(/value:\s*'([\w-]+)'/g)].map(m => m[1])
  if (locales.length === 0)
    fail('в `localeOptions` не разобрано ни одного языка — проверка ослепла')

  return locales
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory())
      out.push(...walk(path))
    else if (path.endsWith('.js'))
      out.push(path)
  }
  return out
}

/**
 * Первое достаточно длинное строковое значение словаря — маркер языка.
 *
 * Короткие пропускаются: `OK` или `Ø` встречаются в бандле сами по себе и дали бы
 * ложное срабатывание.
 */
function marker(value) {
  for (const nested of Object.values(value)) {
    if (typeof nested === 'string' && nested.length > 6)
      return nested
    if (nested && typeof nested === 'object') {
      const found = marker(nested)
      if (found)
        return found
    }
  }
  return null
}

/** Rollup выводит не-ASCII как `\uXXXX` в ВЕРХНЕМ регистре. */
function escaped(text) {
  return [...text].map(char => (char.codePointAt(0) < 128 ? char : `\\u${char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`)).join('')
}

function fail(message) {
  console.error(`[locales] ${message}`)
  process.exit(1)
}

const wanted = new Set(switcherLocales())
const bundle = walk(distDir).map(path => readFileSync(path, 'utf8')).join('\n')

if (bundle.length === 0)
  fail(`в ${distDir} нет ни одного .js — сначала соберите витрину`)

const extra = []
const missing = []

for (const pkg of readdirSync(packagesDir)) {
  const localesDir = join(packagesDir, pkg, 'src/i18n/locales')
  let files
  try {
    files = readdirSync(localesDir).filter(name => name.endsWith('.json'))
  }
  catch {
    continue
  }

  for (const file of files) {
    const locale = file.slice(0, -'.json'.length)
    const text = marker(JSON.parse(readFileSync(join(localesDir, file), 'utf8')))
    if (!text)
      continue

    const present = bundle.includes(text) || bundle.includes(escaped(text))
    if (wanted.has(locale) && !present)
      missing.push(`${pkg}:${locale}`)
    if (!wanted.has(locale) && present)
      extra.push(`${pkg}:${locale}`)
  }
}

// Положительная часть обязательна: без неё сборка, не выдавшая вообще ничего,
// прошла бы гейт как «лишних языков нет».
if (missing.length > 0)
  fail(`языки переключателя не найдены в dist: ${missing.join(', ')}. Сломан импорт локалей или сама проверка.`)

if (extra.length > 0) {
  fail(
    `в dist языки, которых нет в переключателе: ${extra.join(', ')}.\n`
    + `  Переключатель предлагает: ${[...wanted].join(', ')}.\n`
    + '  Почти наверняка где-то стоит импорт агрегата `<pkg>/i18n/all` — он тянет все языки пакета.\n'
    + '  Импортируйте локали поимённо: `import { en, ru } from \'<pkg>/i18n\'` (см. src/i18n/index.ts).',
  )
}

console.log(`[locales] в dist только языки переключателя: ${[...wanted].join(', ')}`)
