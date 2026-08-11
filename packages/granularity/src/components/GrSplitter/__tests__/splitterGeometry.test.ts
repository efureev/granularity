import { describe, expect, it } from 'vitest'

import { clampSize, shouldCollapse, sizeFromPointer } from '../splitterGeometry'

const bounds = { min: 10, max: 90, minEnd: 10 }

describe('clampSize', () => {
  it('держит значение между границами', () => {
    expect(clampSize(50, bounds)).toBe(50)
    expect(clampSize(5, bounds)).toBe(10)
    expect(clampSize(95, bounds)).toBe(90)
  })

  it('`minEnd` ограничивает вторую панель', () => {
    // 100 − 25 = 75: дальше вторая панель ушла бы под свой минимум.
    expect(clampSize(90, { min: 0, max: 100, minEnd: 25 })).toBe(75)
  })

  it('при конфликте `min` и `minEnd` побеждает `min`', () => {
    // Иначе первая панель уехала бы под свой минимум, и вернуть её нечем.
    expect(clampSize(50, { min: 60, max: 100, minEnd: 60 })).toBe(60)
  })

  it('перевёрнутые границы не выдают значений вне 0…100', () => {
    const result = clampSize(50, { min: 80, max: 20, minEnd: 0 })

    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
    expect(result).toBe(80)
  })

  it('нечисло приводится к минимуму, а не уезжает в разметку', () => {
    expect(clampSize(Number.NaN, bounds)).toBe(10)
    expect(clampSize(Number.POSITIVE_INFINITY, bounds)).toBe(10)
    expect(clampSize(50, { min: Number.NaN, max: Number.NaN, minEnd: Number.NaN })).toBe(50)
  })
})

describe('sizeFromPointer', () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 }

  it('переводит координату в проценты по своей оси', () => {
    expect(sizeFromPointer(rect, 300, 0, 'horizontal')).toBe(50)
    expect(sizeFromPointer(rect, 0, 150, 'vertical')).toBe(50)
  })

  it('за пределами контейнера упирается в его края', () => {
    expect(sizeFromPointer(rect, 0, 0, 'horizontal')).toBe(0)
    expect(sizeFromPointer(rect, 9999, 0, 'horizontal')).toBe(100)
  })

  it('схлопнутый контейнер не даёт `NaN`', () => {
    // Панель ещё не в раскладке или скрыта: делить не на что.
    expect(sizeFromPointer({ left: 0, top: 0, width: 0, height: 0 }, 10, 10, 'horizontal')).toBe(0)
  })
})

describe('shouldCollapse', () => {
  it('срабатывает ниже половины минимума', () => {
    expect(shouldCollapse(4, bounds)).toBe(true)
    expect(shouldCollapse(6, bounds)).toBe(false)
  })

  it('без минимума схлопывать не по чему', () => {
    expect(shouldCollapse(0, { min: 0, max: 100, minEnd: 0 })).toBe(false)
  })
})
