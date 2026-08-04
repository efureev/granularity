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
 * Формы множественного числа — объект категорий CLDR (с 0.5.0 `fint-i18n`
 * вернулся к этой форме от строкового `|`-синтаксиса). Набор категорий у языков
 * разный — `en` обходится `one`/`other`, `ru` требует ещё `few` и `many`, — и
 * сравнивать их между локалями бессмысленно. Поэтому блок форм сравнивается как
 * единое целое, а внутрь гейт заглядывает только ради `other`: на неё
 * переводчик сваливается, когда выбранной категории нет.
 *
 * Покрытие категорий каждой локали проверяет `yarn check:messages` — штатный
 * инструмент библиотеки знает правила CLDR, дублировать их здесь незачем.
 */

const LOCALES = { en, ru, es } as Record<string, Record<string, unknown>>

const PLURAL_FORM_KEY_RE = /^(?:zero|one|two|few|many|other|=-?\d+(?:\.\d+)?)$/

const PLACEHOLDER_RE = /\{([a-zA-Z0-9_.-]+)\}/g

type Json = Record<string, unknown>

/** Объект, все ключи которого — формы числа: категории CLDR или точные `=N`. */
function isPluralForms(value: unknown): value is Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false

  const keys = Object.keys(value)
  return keys.length > 0 && keys.every(key => PLURAL_FORM_KEY_RE.test(key))
}

/** Плоская карта «путь → сообщение». Блок форм числа не разворачивается. */
function flatten(source: Json, prefix = ''): Map<string, string | Json> {
  const out = new Map<string, string | Json>()

  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (isPluralForms(value)) {
      out.set(path, value)
      continue
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const [nested, nestedValue] of flatten(value as Json, path))
        out.set(nested, nestedValue)

      continue
    }

    out.set(path, String(value))
  }

  return out
}

function placeholders(value: string | Json): Set<string> {
  const text = typeof value === 'string' ? value : Object.values(value).join(' ')

  return new Set([...text.matchAll(PLACEHOLDER_RE)].map(match => match[1]))
}

const flat = Object.fromEntries(
  Object.entries(LOCALES).map(([locale, payload]) => [locale, flatten(payload)]),
) as Record<string, Map<string, string | Json>>

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

  it.each(['en', 'ru', 'es'])('%s: у каждого блока форм числа есть `other`', (locale) => {
    // Без неё категория без своей формы осталась бы без текста вовсе.
    const broken = [...flat[locale].entries()]
      .filter(([, value]) => isPluralForms(value) && !('other' in value))
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
