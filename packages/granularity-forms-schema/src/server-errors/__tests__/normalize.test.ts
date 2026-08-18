import { describe, expect, it } from 'vitest'

import { toFieldErrorMap } from '../normalize'

/**
 * Форматов ответа три, и все живые. Ошибка, не нашедшая своего поля, не должна
 * исчезать: «сохранение не прошло, а почему — нигде» — худший исход.
 */
describe('toFieldErrorMap', () => {
  it('Laravel: карта «поле → сообщения»', () => {
    const map = toFieldErrorMap({ errors: { email: ['Занято'], 'items.0.name': ['Пусто'] } })

    expect(map.fields).toEqual({ 'email': ['Занято'], 'items.0.name': ['Пусто'] })
  })

  it('скобочная запись пути приводится к точечной', () => {
    const map = toFieldErrorMap({ errors: { 'items[0].name': ['Пусто'] } })

    expect(map.fields).toEqual({ 'items.0.name': ['Пусто'] })
  })

  it('JSON:API: указатель на источник', () => {
    const map = toFieldErrorMap({
      errors: [{ source: { pointer: '/data/attributes/email' }, detail: 'Занято' }],
    }, { stripPrefixes: ['data', 'attributes'] })

    expect(map.fields).toEqual({ email: ['Занято'] })
  })

  it('RFC 7807: список нарушений', () => {
    const map = toFieldErrorMap({ violations: [{ propertyPath: 'user.city', message: 'Обязательно' }] })

    expect(map.fields).toEqual({ 'user.city': ['Обязательно'] })
  })

  it('обёртка ответа axios разворачивается', () => {
    const map = toFieldErrorMap({ response: { data: { errors: { email: ['Занято'] } } } })

    expect(map.fields).toEqual({ email: ['Занято'] })
  })

  it('псевдоним чинит расхождение имён', () => {
    const map = toFieldErrorMap({ errors: { email_address: ['Занято'] } }, {
      aliases: { email_address: 'email' },
    })

    expect(map.fields).toEqual({ email: ['Занято'] })
  })

  it('сообщение без поля уходит в сводку, а не теряется', () => {
    const map = toFieldErrorMap({ message: 'Сохранение не удалось' })

    expect(map.form).toEqual(['Сохранение не удалось'])
    expect(map.fields).toEqual({})
  })

  it('строка вместо объекта тоже показывается', () => {
    expect(toFieldErrorMap('Сервер недоступен').form).toEqual(['Сервер недоступен'])
  })
})
