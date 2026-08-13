import { describe, expect, it } from 'vitest'

import en from '../locales/en.json'
import es from '../locales/es.json'
import ru from '../locales/ru.json'

/**
 * Гейт полноты локалей — копия того, что живёт в ядре
 * (`packages/granularity/src/i18n/__tests__/localeCompleteness.test.ts`).
 *
 * Правило «строка, которую видит пользователь, живёт в трёх локалях» иначе
 * держится на внимательности: пропущенный ключ ничем не проявляется — `t()`
 * молча отдаёт английский fallback из компонента, и перевода просто нет.
 *
 * Форм множественного числа у пакета нет: считать он умеет только даты, а их
 * склоняет `Intl`. Поэтому проверяются ключи и плейсхолдеры, а блока форм
 * здесь не бывает.
 */

const LOCALES = { en, ru, es } as Record<string, Record<string, unknown>>

const PLACEHOLDER_RE = /\{([\w.-]+)\}/g

type Json = Record<string, unknown>

/** Плоская карта «путь → сообщение». */
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

function placeholders(value: string): Set<string> {
  return new Set([...value.matchAll(PLACEHOLDER_RE)].map(match => match[1] as string))
}

const flat = Object.fromEntries(
  Object.entries(LOCALES).map(([locale, payload]) => [locale, flatten(payload)]),
) as Record<string, Map<string, string>>

describe('полнота локалей', () => {
  it.each(['ru', 'es'])('%s покрывает все ключи en', (locale) => {
    const missing = [...flat.en!.keys()].filter(key => !flat[locale]!.has(key))

    expect(missing, `нет перевода: ${missing.join(', ')}`).toEqual([])
  })

  it.each(['ru', 'es'])('%s не содержит ключей, которых нет в en', (locale) => {
    // Осиротевший ключ — либо опечатка, либо хвост после переименования:
    // показать его пакет всё равно не сможет.
    const extra = [...flat[locale]!.keys()].filter(key => !flat.en!.has(key))

    expect(extra, `ключа нет в en: ${extra.join(', ')}`).toEqual([])
  })

  it.each(['ru', 'es'])('%s использует те же плейсхолдеры, что и en', (locale) => {
    // Опечатка в `{date}` не ломает ни сборку, ни тесты компонента —
    // плейсхолдер просто останется в тексте как есть.
    const mismatched = [...flat.en!.entries()]
      .filter(([key, value]) => {
        const translated = flat[locale]!.get(key)
        if (translated === undefined) return false

        const expected = placeholders(value)
        const actual = placeholders(translated)

        return expected.size !== actual.size || [...expected].some(name => !actual.has(name))
      })
      .map(([key]) => key)

    expect(mismatched, `плейсхолдеры разошлись: ${mismatched.join(', ')}`).toEqual([])
  })

  it('ключи компонентов и ключи словаря — одно и то же множество', () => {
    // Словарь без употребления и употребление без словаря одинаково незаметны:
    // первое — мёртвый вес, второе — английский fallback вместо перевода.
    const asked = new Set<string>()
    // Ключ ищется как строковый литерал, а не как аргумент `t()`: часть их
    // лежит таблицами (`columnLabels` в колонках времени), и разбор по вызову
    // объявил бы эти ключи неиспользуемыми.
    const files = {
      ...import.meta.glob('../../components/**/*.vue', { query: '?raw', import: 'default', eager: true }),
      ...import.meta.glob('../../internal/*.{ts,vue}', { query: '?raw', import: 'default', eager: true }),
    }

    for (const source of Object.values(files)) {
      for (const match of String(source).matchAll(/'grDashboard\.([\w.]+)'/g))
        asked.add(match[1] as string)
    }

    // Ключи ядра (`gr.common.*`) сюда не попадают по построению: у них другой
    // блок, и объявляет их не этот словарь.
    const own = [...asked].sort()
    const declared = [...flat.en!.keys()].sort()

    expect(own.length, 'ни один ключ не найден — сломан разбор, а не словарь').toBeGreaterThan(5)
    expect(own.filter(key => !declared.includes(key)), 'ключ спрашивают, но его нет в словаре').toEqual([])
    expect(declared.filter(key => !own.includes(key)), 'ключ в словаре, но его никто не спрашивает').toEqual([])
  })
})
