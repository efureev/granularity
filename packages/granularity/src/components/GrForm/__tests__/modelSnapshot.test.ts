import { describe, expect, it } from 'vitest'

import { cloneModelValue, modelFingerprint } from '../modelSnapshot'

const pdf = () => new File(['x'], 'contract.pdf', { type: 'application/pdf', lastModified: 1 })

describe('cloneModelValue', () => {
  it('файл отдаётся по ссылке: сброс обязан вернуть тот самый файл', () => {
    const file = pdf()
    const clone = cloneModelValue({ doc: file, docs: [file] })

    expect(clone.doc).toBe(file)
    expect(clone.docs[0]).toBe(file)
  })

  it('обычные данные клонируются, а не переиспользуются', () => {
    const source = { nested: { city: 'X' }, list: [1, 2] }
    const clone = cloneModelValue(source)

    expect(clone).toEqual(source)
    expect(clone.nested).not.toBe(source.nested)
    expect(clone.list).not.toBe(source.list)
  })

  it('JSON-семантика сохранена: toJSON, отброшенные функции, дырки массива', () => {
    const clone = cloneModelValue({
      at: new Date('2020-01-02T03:04:05.000Z'),
      fn: () => 'нельзя',
      list: [1, () => 2, 3],
      nothing: undefined,
    })

    expect(clone.at).toBe('2020-01-02T03:04:05.000Z')
    expect('fn' in clone).toBe(false)
    expect('nothing' in clone).toBe(false)
    // Индексы сдвигать нельзя, поэтому не-сериализуемый элемент становится `null`.
    expect(clone.list).toEqual([1, null, 3])
  })

  it('undefined остаётся undefined', () => {
    expect(cloneModelValue(undefined)).toBeUndefined()
  })
})

describe('modelFingerprint', () => {
  it('разные файлы дают разные отпечатки, один и тот же — одинаковые', () => {
    const file = pdf()

    expect(modelFingerprint({ doc: file })).toBe(modelFingerprint({ doc: file }))
    // До отпечатка любой `File` сериализовался в `{}`, и подмена документа была
    // неотличима от бездействия.
    expect(modelFingerprint({ doc: file }))
      .not.toBe(modelFingerprint({ doc: new File(['yy'], 'draft.pdf', { lastModified: 1 }) }))
  })

  it('копия файла с теми же именем, размером и временем считается тем же значением', () => {
    // Сравнение по ссылке здесь не годится: `resetFields` кладёт в модель то,
    // что лежит в снимке, и форма обязана погаснуть, а не остаться грязной.
    const a = new File(['x'], 'contract.pdf', { lastModified: 1 })
    const b = new File(['x'], 'contract.pdf', { lastModified: 1 })

    expect(modelFingerprint({ doc: a })).toBe(modelFingerprint({ doc: b }))
  })

  it('остальные значения сравниваются как раньше', () => {
    expect(modelFingerprint({ a: 1, b: 'x' })).toBe(modelFingerprint({ a: 1, b: 'x' }))
    expect(modelFingerprint({ a: 1 })).not.toBe(modelFingerprint({ a: 2 }))
  })
})
