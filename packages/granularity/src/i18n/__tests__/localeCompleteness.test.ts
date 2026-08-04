import { describe, expect, it } from 'vitest'

import en from '../locales/en.json'
import es from '../locales/es.json'
import ru from '../locales/ru.json'

/**
 * Гейт полноты локалей.
 *
 * Правило «строка, которую видит пользователь, живёт в трёх локалях» до сих пор
 * держалось на внимательности: пропущенный ключ в `ru`/`es` ничем не проявлялся —
 * `t()` молча возвращал английский fallback, и перевода просто не было.
 *
 * Формы множественного числа живут внутри строки (`one:… | few:… | other:…`) —
 * их разбирает переводчик, не пакет. Набор форм у языков разный, поэтому
 * сравнивать их между локалями бессмысленно; гейт лишь требует ветку `other`:
 * именно на неё переводчик сваливается, когда выбранной категории нет.
 */

const LOCALES = { en, ru, es } as Record<string, Record<string, unknown>>

const PLURAL_LABEL_RE = /^\s*(?:zero|one|two|few|many|other|=\d+)\s*:/

const PLACEHOLDER_RE = /\{([a-zA-Z0-9_.-]+)\}/g

type Json = Record<string, unknown>

/** Формы, размеченные метками CLDR: `one:… | other:…`. */
function pluralForms(text: string): string[] | null {
  const forms = text.split(/(?<!\|)\|(?!\|)/)
  if (forms.length < 2 || !forms.some(form => PLURAL_LABEL_RE.test(form))) return null

  return forms
}

/** Плоская карта «путь → строка». */
function flatten(source: Json, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()

  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const [nested, nestedValue] of flatten(value as Json, path))
        out.set(nested, nestedValue)

      continue
    }

    out.set(path, String(value))
  }

  return out
}

function placeholders(text: string): Set<string> {
  return new Set([...text.matchAll(PLACEHOLDER_RE)].map(match => match[1]))
}

const flat = Object.fromEntries(
  Object.entries(LOCALES).map(([locale, payload]) => [locale, flatten(payload)]),
) as Record<string, Map<string, string>>

describe('полнота локалей', () => {
  it.each(['ru', 'es'])('%s покрывает все ключи en', (locale) => {
    const missing = [...flat.en.keys()].filter(key => !flat[locale].has(key))

    expect(missing, `нет перевода: ${missing.join(', ')}`).toEqual([])
  })

  it.each(['ru', 'es'])('%s не содержит ключей, которых нет в en', (locale) => {
    // Осиротевший ключ — это либо опечатка, либо забытый после переименования
    // хвост: показать его пакет всё равно не сможет.
    const extra = [...flat[locale].keys()].filter(key => !flat.en.has(key))

    expect(extra, `ключа нет в en: ${extra.join(', ')}`).toEqual([])
  })

  it.each(['en', 'ru', 'es'])('%s: у размеченных форм числа есть ветка `other`', (locale) => {
    // Без неё переводчик, выбрав категорию без своей формы, возьмёт последнюю
    // попавшуюся — то есть текст будет зависеть от порядка записи.
    const broken = [...flat[locale].entries()]
      .filter(([, value]) => {
        const forms = pluralForms(value)
        return forms !== null && !forms.some(form => /^\s*other\s*:/.test(form))
      })
      .map(([key]) => key)

    expect(broken, `нет ветки other: ${broken.join(', ')}`).toEqual([])
  })

  it.each(['ru', 'es'])('%s использует те же плейсхолдеры, что и en', (locale) => {
    // Опечатка в `{column}` не ломает сборку и не видна в тестах компонента —
    // плейсхолдер просто останется в тексте как есть.
    const mismatched = [...flat.en.entries()]
      .filter(([key, value]) => {
        const translated = flat[locale].get(key)
        if (translated === undefined) return false

        const expected = placeholders(value)
        const actual = placeholders(translated)

        return expected.size !== actual.size || [...expected].some(name => !actual.has(name))
      })
      .map(([key]) => key)

    expect(mismatched, `плейсхолдеры разошлись: ${mismatched.join(', ')}`).toEqual([])
  })
})
