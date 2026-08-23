import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

const PLACEHOLDER_RE = /\{([\w.-]+)\}/g
/** Категории CLDR и точные значения счётчика (`=0`). */
const PLURAL_FORM_KEY_RE = /^(?:zero|one|two|few|many|other|=-?\d+(?:\.\d+)?)$/

type Json = Record<string, unknown>

export interface LocaleCompletenessGateOptions {
  /** Префикс блока: `gr`, `grChrono`, `grCharts`, `grDashboard`, `grForms`. */
  block: string
  /** Директория локалей; по умолчанию — `<cwd>/src/i18n/locales`. */
  localesDir?: string
  /** Локали пакета; первая — базовая. */
  locales?: readonly string[]
  /**
   * У пакета есть формы множественного числа (объект категорий CLDR).
   * Их набор у языков разный, поэтому блок сравнивается целиком, а не по ключам.
   */
  pluralForms?: boolean
  /**
   * Сверять множество спрашиваемых ключей с объявленными.
   *
   * Выключается там, где ключи строятся динамически: ядро собирает их шаблоном
   * (`` t(`gr.form.${kind}`) ``), и статически такой ключ не восстановить —
   * 183 найденных против 241 объявленного.
   */
  keyParity?: false | { sourceDirs?: readonly string[] }
}

function isPluralForms(value: unknown): value is Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false

  const keys = Object.keys(value)

  return keys.length > 0 && keys.every(key => PLURAL_FORM_KEY_RE.test(key))
}

/** Плоская карта «путь → сообщение». Блок форм числа не разворачивается. */
function flatten(source: Json, keepPlurals: boolean, prefix = ''): Map<string, string | Json> {
  const out = new Map<string, string | Json>()

  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (keepPlurals && isPluralForms(value)) {
      out.set(path, value)
      continue
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const [nested, nestedValue] of flatten(value as Json, keepPlurals, path))
        out.set(nested, nestedValue)

      continue
    }

    out.set(path, String(value))
  }

  return out
}

function placeholders(value: string | Json): Set<string> {
  const text = typeof value === 'string' ? value : Object.values(value).join(' ')

  return new Set([...text.matchAll(PLACEHOLDER_RE)].map(match => match[1] as string))
}

/** Рекурсивный обход исходников: ключи ищутся строковым литералом. */
function sourceFiles(dir: string, acc: string[] = []): string[] {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  }
  catch {
    return acc
  }

  for (const entry of entries) {
    const path = resolve(dir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name !== '__tests__')
        sourceFiles(path, acc)
    }
    else if (/\.(?:vue|ts)$/.test(entry.name) && !entry.name.includes('.test.')) {
      acc.push(path)
    }
  }

  return acc
}

/**
 * Гейт полноты локалей.
 *
 * Правило «строка, которую видит пользователь, живёт во всех локалях» иначе
 * держится на внимательности: пропущенный ключ ничем не проявляется — `t()`
 * молча отдаёт английский fallback из компонента, и перевода просто нет.
 *
 * Локали читаются с диска, а не статическим `import`, и исходники обходятся
 * `node:fs`, а не `import.meta.glob`: глоб Vite разворачивает относительно
 * импортирующего файла, и в собранном тест-ките он сканировал бы сам тест-кит.
 */
export function defineLocaleCompletenessGate(options: LocaleCompletenessGateOptions): void {
  const localesDir = options.localesDir ?? resolve(process.cwd(), 'src/i18n/locales')
  const locales = options.locales ?? ['en', 'ru', 'es']
  const [base, ...translations] = locales
  const keepPlurals = options.pluralForms ?? false

  const flat = Object.fromEntries(locales.map((locale) => {
    const payload = JSON.parse(readFileSync(resolve(localesDir, `${locale}.json`), 'utf8')) as Json

    return [locale, flatten(payload, keepPlurals)]
  })) as Record<string, Map<string, string | Json>>

  const baseKeys = flat[base!]!

  describe('полнота локалей', () => {
    it('базовая локаль не пуста — гейт не молчит на сломанном чтении', () => {
      expect(baseKeys.size, `в ${base}.json не найдено ни одного ключа`).toBeGreaterThan(0)
    })

    it.each(translations)('%s покрывает все ключи базовой локали', (locale) => {
      const missing = [...baseKeys.keys()].filter(key => !flat[locale]!.has(key))

      expect(missing, `нет перевода: ${missing.join(', ')}`).toEqual([])
    })

    it.each(translations)('%s не содержит ключей, которых нет в базовой', (locale) => {
      // Осиротевший ключ — либо опечатка, либо хвост после переименования:
      // показать его пакет всё равно не сможет.
      const extra = [...flat[locale]!.keys()].filter(key => !baseKeys.has(key))

      expect(extra, `ключа нет в ${base}: ${extra.join(', ')}`).toEqual([])
    })

    it.each(translations)('%s использует те же плейсхолдеры', (locale) => {
      // Опечатка в `{date}` не ломает ни сборку, ни тесты компонента —
      // плейсхолдер просто останется в тексте как есть.
      const mismatched = [...baseKeys.entries()]
        .filter(([key, value]) => {
          const translated = flat[locale]!.get(key)
          if (translated === undefined)
            return false

          const expected = placeholders(value)
          const actual = placeholders(translated)

          return expected.size !== actual.size || [...expected].some(name => !actual.has(name))
        })
        .map(([key]) => key)

      expect(mismatched, `плейсхолдеры разошлись: ${mismatched.join(', ')}`).toEqual([])
    })

    it.runIf(options.keyParity !== false)('ключи компонентов и словаря — одно множество', () => {
      // Словарь без употребления и употребление без словаря одинаково незаметны:
      // первое — мёртвый вес, второе — английский fallback вместо перевода.
      // По умолчанию — весь `src`: ключи живут не только в компонентах
      // (у forms-schema — в `validation/`, у chrono — в `internal/`), и узкий
      // список директорий молча объявлял бы такие ключи неиспользуемыми.
      const dirs = (options.keyParity === false ? [] : options.keyParity?.sourceDirs) ?? ['src']
      const asked = new Set<string>()
      // Ключ ищется строковым литералом, а не аргументом `t()`: часть их лежит
      // таблицами, и разбор по вызову объявил бы эти ключи неиспользуемыми.
      const pattern = new RegExp(`'${options.block}\\.([\\w.]+)'`, 'g')

      for (const dir of dirs) {
        for (const file of sourceFiles(resolve(process.cwd(), dir))) {
          for (const match of readFileSync(file, 'utf8').matchAll(pattern))
            asked.add(match[1] as string)
        }
      }

      const own = [...asked].sort()
      const declared = [...baseKeys.keys()].sort()

      expect(own.length, 'ни один ключ не найден — сломан разбор, а не словарь').toBeGreaterThan(5)
      expect(own.filter(key => !declared.includes(key)), 'ключ спрашивают, но его нет в словаре').toEqual([])
      expect(declared.filter(key => !own.includes(key)), 'ключ в словаре, но его никто не спрашивает').toEqual([])
    })
  })
}
