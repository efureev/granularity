import { describe, expect, it } from 'vitest'

import { formatHexColor, hslaToCss, normalizeHsla, parseHexColor } from '../color'

describe('parseHexColor', () => {
  it('читает все четыре формы hex, решётка и регистр необязательны', () => {
    expect(parseHexColor('#ff0000')).toMatchObject({ h: 0, s: 100, l: 50, a: 1 })
    expect(parseHexColor('#F00')).toMatchObject({ h: 0, s: 100, l: 50, a: 1 })
    expect(parseHexColor('00ff00')).toMatchObject({ h: 120, s: 100, l: 50, a: 1 })
    expect(parseHexColor('#0000ff80')?.a).toBeCloseTo(0.5, 2)
    expect(parseHexColor('#00f8')?.a).toBeCloseTo(0.53, 2)
  })

  it('мусор возвращает null, а не бросает', () => {
    // Значение приходит и из модели снаружи, и из поля ввода: упавший компонент
    // — худший ответ на опечатку.
    for (const value of ['', '#', 'red', '#gg0000', '#12345', 'rgb(1,2,3)', null, undefined, 42, {}])
      expect(parseHexColor(value), String(value)).toBeNull()
  })

  it('серый не получает случайного оттенка', () => {
    const gray = parseHexColor('#808080')

    expect(gray?.s).toBe(0)
    expect(gray?.h).toBe(0)
  })

  it('края шкалы разбираются без переполнения', () => {
    expect(parseHexColor('#000000')).toMatchObject({ s: 0, l: 0, a: 1 })
    expect(parseHexColor('#ffffff')).toMatchObject({ s: 0, l: 100, a: 1 })
    expect(parseHexColor('#00000000')?.a).toBe(0)
  })
})

describe('formatHexColor', () => {
  it('собирает шестизначную форму, альфу отбрасывает без пропа', () => {
    // Компонент без `alpha` не вправе отдавать форму, которую потребитель не ждёт.
    expect(formatHexColor({ h: 0, s: 100, l: 50, a: 0.5 })).toBe('#ff0000')
    expect(formatHexColor({ h: 0, s: 100, l: 50, a: 0.5 }, true)).toBe('#ff000080')
  })

  it('альфа на краях даёт 00 и ff', () => {
    expect(formatHexColor({ h: 210, s: 50, l: 50, a: 0 }, true).slice(-2)).toBe('00')
    expect(formatHexColor({ h: 210, s: 50, l: 50, a: 1 }, true).slice(-2)).toBe('ff')
  })

  it('значения за пределами шкалы зажимаются, а не переполняются', () => {
    expect(formatHexColor({ h: 400, s: 150, l: -20, a: 2 }, true)).toMatch(/^#[0-9a-f]{8}$/)
  })
})

describe('round-trip', () => {
  it('hex → hsla → hex возвращает исходный цвет', () => {
    for (const hex of ['#3b82f6', '#ff0088', '#123456', '#000000', '#ffffff', '#808080']) {
      const parsed = parseHexColor(hex)
      expect(parsed, hex).not.toBeNull()
      expect(formatHexColor(parsed!), hex).toBe(hex)
    }
  })

  it('восьмизначный hex переживает круг вместе с альфой', () => {
    for (const hex of ['#3b82f6cc', '#ff008800', '#123456ff']) {
      expect(formatHexColor(parseHexColor(hex)!, true)).toBe(hex)
    }
  })
})

describe('hslaToCss и normalizeHsla', () => {
  it('css-запись годится для градиента и превью', () => {
    expect(hslaToCss({ h: 217, s: 91, l: 60, a: 1 })).toBe('hsl(217 91% 60% / 1)')
    expect(hslaToCss({ h: 217, s: 91, l: 60, a: 0.4 })).toBe('hsl(217 91% 60% / 0.4)')
  })

  it('оттенок цикличен: 360° — это 0°', () => {
    expect(normalizeHsla({ h: 360, s: 10, l: 10, a: 1 }).h).toBe(0)
    expect(normalizeHsla({ h: -30, s: 10, l: 10, a: 1 }).h).toBe(330)
    expect(hslaToCss({ h: 360, s: 0, l: 0, a: 1 })).toContain('hsl(0 ')
  })

  it('каналы зажимаются в свои диапазоны', () => {
    expect(normalizeHsla({ h: 10, s: 500, l: -5, a: 3 })).toEqual({ h: 10, s: 100, l: 0, a: 1 })
  })
})
