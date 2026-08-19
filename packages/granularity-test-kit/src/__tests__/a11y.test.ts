// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'

import { axeViolations } from '../a11y'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('axeViolations', () => {
  it('чистая разметка даёт пустой список', async () => {
    document.body.innerHTML = '<main><button type="button">Сохранить</button></main>'

    expect(await axeViolations(document.body)).toEqual([])
  })

  it('находит нарушение и называет его строкой `id: help (n)`', async () => {
    // Кнопка без доступного имени — правило `button-name`, impact `critical`.
    document.body.innerHTML = '<main><button type="button"></button></main>'

    const violations = await axeViolations(document.body)

    expect(violations).toHaveLength(1)
    expect(violations[0]).toMatch(/^button-name: .+ \(1\)$/)
  })

  it('фильтр impact сужается опцией', async () => {
    document.body.innerHTML = '<main><button type="button"></button></main>'

    expect(await axeViolations(document.body, { impacts: ['minor'] })).toEqual([])
  })

  it('своё правило докладывается к дефолтным, не заменяя их', async () => {
    document.body.innerHTML = '<main><button type="button"></button></main>'

    // Гасим ровно найденное правило: если бы объект правил заменялся целиком,
    // `color-contrast` включился бы обратно, а `button-name` остался.
    expect(await axeViolations(document.body, { rules: { 'button-name': { enabled: false } } })).toEqual([])
  })
})
