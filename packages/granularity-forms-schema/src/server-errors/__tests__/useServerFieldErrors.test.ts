import { describe, expect, it } from 'vitest'

import { useServerFieldErrors } from '../useServerFieldErrors'

describe('useServerFieldErrors', () => {
  it('разбирает ответ и отдаёт ошибку по пути', () => {
    const errors = useServerFieldErrors()
    errors.set({ errors: { email: ['Занято'] } })

    expect(errors.get('email')).toEqual(['Занято'])
    expect(errors.has('email')).toBe(true)
  })

  it('правка поля снимает его ошибку', () => {
    const errors = useServerFieldErrors()
    errors.set({ errors: { email: ['Занято'] } })
    errors.dismiss('email')

    expect(errors.has('email')).toBe(false)
  })

  /** Ошибка на поле, которого форма не рисует, обязана быть видна сводкой. */
  it('ошибка без своего поля становится сиротой и уходит в сводку', () => {
    const errors = useServerFieldErrors({ knownPaths: () => ['email'] })
    errors.set({ errors: { email: ['Занято'], secret: ['Нельзя'] } })

    expect(errors.orphans.value).toEqual([{ path: 'secret', messages: ['Нельзя'] }])
    expect(errors.formErrors.value).toContain('Нельзя')
  })

  it('удаление строки повторителя сдвигает ошибки хвоста', () => {
    const errors = useServerFieldErrors()
    errors.set({
      errors: { 'items.0.name': ['Первая'], 'items.1.name': ['Вторая'], 'items.2.name': ['Третья'] },
    })

    errors.shiftAfter('items', 1, -1)

    expect(Object.keys(errors.errors.value).sort()).toEqual(['items.0.name', 'items.1.name'])
    expect(errors.get('items.1.name')).toEqual(['Третья'])
  })

  it('добавление строки раздвигает ошибки хвоста', () => {
    const errors = useServerFieldErrors()
    errors.set({ errors: { 'items.0.name': ['Первая'] } })

    errors.shiftAfter('items', 0, 1)

    expect(errors.get('items.1.name')).toEqual(['Первая'])
  })

  it('перестановка строк переносит ошибку вместе со строкой', () => {
    const errors = useServerFieldErrors()
    errors.set({ errors: { 'items.0.name': ['Первая'], 'items.2.name': ['Третья'] } })

    errors.reindex('items', 0, 2)

    expect(errors.get('items.2.name')).toEqual(['Первая'])
    expect(errors.get('items.1.name')).toEqual(['Третья'])
  })

  it('очистка снимает и поля, и сводку', () => {
    const errors = useServerFieldErrors()
    errors.set({ errors: { email: ['Занято'] }, message: 'Не вышло' })
    errors.clear()

    expect(errors.errors.value).toEqual({})
    expect(errors.formErrors.value).toEqual([])
  })
})
