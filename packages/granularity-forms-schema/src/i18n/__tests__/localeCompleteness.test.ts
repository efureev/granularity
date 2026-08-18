import { describe, expect, it } from 'vitest'

import en from '../locales/en.json'
import es from '../locales/es.json'
import ru from '../locales/ru.json'

/**
 * Полнота локалей.
 *
 * Пропущенный ключ не падает — он показывает английский fallback посреди
 * русского интерфейса, и замечают это уже пользователи.
 */
type Dictionary = Record<string, Record<string, string>>

function flatten(dictionary: Dictionary): string[] {
  return Object.entries(dictionary)
    .flatMap(([block, entries]) => Object.keys(entries).map(key => `${block}.${key}`))
    .sort()
}

const locales: [string, Dictionary][] = [['ru', ru], ['es', es]]

describe('локали', () => {
  it.each(locales)('%s содержит все ключи английского словаря', (_name, dictionary) => {
    expect(flatten(dictionary)).toEqual(flatten(en as Dictionary))
  })

  /** Плейсхолдеры — часть контракта строки: потерянный `{index}` ломает фразу. */
  it.each(locales)('%s сохраняет плейсхолдеры', (_name, dictionary) => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
    const offenders: string[] = []

    for (const [block, entries] of Object.entries(en as Dictionary)) {
      for (const [key, text] of Object.entries(entries)) {
        const translated = dictionary[block]?.[key] ?? ''
        if (JSON.stringify(placeholders(text)) !== JSON.stringify(placeholders(translated)))
          offenders.push(`${block}.${key}`)
      }
    }

    expect(offenders, offenders.join(', ')).toEqual([])
  })
})
