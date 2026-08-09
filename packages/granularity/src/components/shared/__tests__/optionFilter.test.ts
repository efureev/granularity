import { describe, expect, it, vi } from 'vitest'

import {
  filterOptions,
  matchesOptionQuery,
  matchesQueryParts,
  normalizeOptionQuery,
  resolveSelectedOptions,
} from '../optionFilter'

const options = [
  { value: 'ru', label: 'Россия' },
  { value: 'us', label: 'United States' },
  { value: 'de', label: 'Germany' },
]

describe('normalizeOptionQuery', () => {
  it('снимает краевые пробелы и регистр', () => {
    expect(normalizeOptionQuery('  UnIted  ')).toBe('united')
  })
})

describe('matchesQueryParts', () => {
  it('пустой запрос подходит всему', () => {
    expect(matchesQueryParts(['что угодно'], '')).toBe(true)
  })

  it('пропускает отсутствующие поля, а не падает на них', () => {
    expect(matchesQueryParts([undefined, 'Open settings', undefined], 'settings')).toBe(true)
    expect(matchesQueryParts([undefined], 'settings')).toBe(false)
  })

  it('ищет подстроку, а не префикс', () => {
    expect(matchesQueryParts(['Open settings'], 'set')).toBe(true)
  })
})

describe('matchesOptionQuery', () => {
  it('матчит и по метке, и по значению', () => {
    expect(matchesOptionQuery({ value: 'us', label: 'United States' }, 'united')).toBe(true)
    expect(matchesOptionQuery({ value: 'us', label: 'United States' }, 'us')).toBe(true)
    expect(matchesOptionQuery({ value: 'us', label: 'United States' }, 'ru')).toBe(false)
  })

  it('нечувствителен к регистру метки', () => {
    expect(matchesOptionQuery({ value: 1, label: 'ГЕРМАНИЯ' }, 'герм')).toBe(true)
  })
})

describe('filterOptions', () => {
  it('пустой запрос отдаёт тот же массив и не зовёт матчер', () => {
    const filter = vi.fn(() => true)

    expect(filterOptions(options, '   ', filter)).toBe(options)
    expect(filter).not.toHaveBeenCalled()
  })

  it('фильтрует матчером по умолчанию', () => {
    expect(filterOptions(options, ' UNI ').map(option => option.value)).toEqual(['us'])
  })

  /**
   * Проп `filter` — публичный контракт `GrAutocomplete`: чужая реализация
   * вправе смотреть на регистр, поэтому лоукейс к ней не применяется.
   */
  it('пользовательскому матчеру отдаёт сырой запрос, только без краевых пробелов', () => {
    const seen: string[] = []

    filterOptions(options, '  Germ  ', (option, query) => {
      seen.push(query)
      return option.value === 'de'
    })

    expect(new Set(seen)).toEqual(new Set(['Germ']))
  })

  it('не мутирует исходный список', () => {
    const source = [...options]
    filterOptions(source, 'uni')

    expect(source).toHaveLength(3)
  })
})

describe('resolveSelectedOptions', () => {
  it('подставляет опции в порядке значений', () => {
    expect(resolveSelectedOptions(['de', 'ru'], options).map(option => option.label))
      .toEqual(['Germany', 'Россия'])
  })

  /**
   * Значение вне списка — это `allowCustomValue` либо модель, пришедшая раньше
   * опций. Спрятать его нельзя: пользователь увидел бы пустое место вместо
   * своего выбора.
   */
  it('неизвестное значение показывает как есть', () => {
    expect(resolveSelectedOptions(['xx'], options)).toEqual([{ value: 'xx', label: 'xx' }])
  })

  it('сравнивает через свой ключ — объектные значения приходят копией', () => {
    type Person = { id: number, name: string }
    const people = [
      { value: { id: 1, name: 'Аня' }, label: 'Аня' },
      { value: { id: 2, name: 'Борис' }, label: 'Борис' },
    ]

    const resolved = resolveSelectedOptions<Person, typeof people[number]>(
      [{ id: 2, name: 'Борис' }],
      people,
      value => String(value.id),
    )

    expect(resolved[0]?.label).toBe('Борис')
  })

  it('дубликат ключа берёт первую опцию: подпись чипа не зависит от порядка обхода', () => {
    const withDuplicate = [
      { value: 'ru', label: 'Россия' },
      { value: 'ru', label: 'Russian Federation' },
    ]

    expect(resolveSelectedOptions(['ru'], withDuplicate)[0]?.label).toBe('Россия')
  })
})
