import { describe, expect, it } from 'vitest'

import {
  affixOffsetLength,
  affixRootMargin,
  isAffixStuck,
  scanAffixAncestors,
} from '../affixState'

describe('affixOffsetLength', () => {
  it('число превращает в пиксели', () => {
    expect(affixOffsetLength(0)).toBe('0px')
    expect(affixOffsetLength(112)).toBe('112px')
    expect(affixOffsetLength(12.5)).toBe('12.5px')
  })

  it('отрицательное зажимает в ноль: отрицательный порог прячет панель за край', () => {
    expect(affixOffsetLength(-8)).toBe('0px')
  })

  it('нечисло переменной не пишет', () => {
    expect(affixOffsetLength(Number.NaN)).toBeUndefined()
    expect(affixOffsetLength(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(affixOffsetLength(undefined)).toBeUndefined()
  })

  it('строку отдаёт как есть — иначе проп проигрывает голому style', () => {
    expect(affixOffsetLength('4rem')).toBe('4rem')
    expect(affixOffsetLength('var(--app-header-h)')).toBe('var(--app-header-h)')
    expect(affixOffsetLength('calc(var(--h) + 8px)')).toBe('calc(var(--h) + 8px)')
    expect(affixOffsetLength('  56px  ')).toBe('56px')
  })

  it('пустая строка — это отсутствие значения, а не значение', () => {
    expect(affixOffsetLength('')).toBeUndefined()
    expect(affixOffsetLength('   ')).toBeUndefined()
  })
})

describe('affixRootMargin', () => {
  it('поджимает ровно тот край, к которому прилипаем', () => {
    expect(affixRootMargin('top', 112)).toBe('-112px 0px 0px 0px')
    expect(affixRootMargin('bottom', 112)).toBe('0px 0px -112px 0px')
  })

  it('нулевой отступ оставляет край нетронутым', () => {
    expect(affixRootMargin('top', 0)).toBe('0px 0px 0px 0px')
    expect(affixRootMargin('bottom', 0)).toBe('0px 0px 0px 0px')
  })

  it('дробное округляет: rootMargin субпиксели игнорирует', () => {
    expect(affixRootMargin('top', 55.6)).toBe('-56px 0px 0px 0px')
  })

  it('отрицательное и нечисло сводит к нулю', () => {
    expect(affixRootMargin('top', -20)).toBe('0px 0px 0px 0px')
    expect(affixRootMargin('bottom', Number.NaN)).toBe('0px 0px 0px 0px')
  })
})

describe('isAffixStuck', () => {
  const bounds = { top: 100, bottom: 800 }

  describe('placement="top"', () => {
    it('сентинел ниже линии — не прилипло', () => {
      expect(isAffixStuck({ boundingClientRect: { top: 300, bottom: 301 }, rootBounds: bounds }, 'top', false)).toBe(false)
    })

    it('ровно на линии — ещё не прилипло, переключит следующий пиксель', () => {
      expect(isAffixStuck({ boundingClientRect: { top: 100, bottom: 101 }, rootBounds: bounds }, 'top', false)).toBe(false)
    })

    it('сентинел ушёл выше линии — прилипло', () => {
      expect(isAffixStuck({ boundingClientRect: { top: 99, bottom: 100 }, rootBounds: bounds }, 'top', false)).toBe(true)
    })

    it('containing block кончился и коробка уехала за экран — всё ещё прилипло', () => {
      expect(isAffixStuck({ boundingClientRect: { top: -4000, bottom: -3999 }, rootBounds: bounds }, 'top', true)).toBe(true)
    })
  })

  describe('placement="bottom"', () => {
    it('естественный низ выше линии — не прилипло', () => {
      expect(isAffixStuck({ boundingClientRect: { top: 499, bottom: 500 }, rootBounds: bounds }, 'bottom', false)).toBe(false)
    })

    it('ровно на линии — ещё не прилипло', () => {
      expect(isAffixStuck({ boundingClientRect: { top: 799, bottom: 800 }, rootBounds: bounds }, 'bottom', false)).toBe(false)
    })

    it('естественный низ ушёл ниже линии — прилипло', () => {
      expect(isAffixStuck({ boundingClientRect: { top: 800, bottom: 801 }, rootBounds: bounds }, 'bottom', false)).toBe(true)
    })
  })

  it('пустой rootBounds оставляет прошлое состояние, а не выдумывает новое', () => {
    const entry = { boundingClientRect: { top: -50, bottom: -49 }, rootBounds: null }

    expect(isAffixStuck(entry, 'top', true)).toBe(true)
    expect(isAffixStuck(entry, 'top', false)).toBe(false)
    expect(isAffixStuck(entry, 'bottom', true)).toBe(true)
  })
})

describe('scanAffixAncestors', () => {
  it('без предков прокручивается вьюпорт', () => {
    expect(scanAffixAncestors([])).toEqual({ scrollerIndex: -1, clipperLabel: null })
  })

  it('цепочка из одних visible — вьюпорт и никаких претензий', () => {
    const scan = scanAffixAncestors([
      { overflowY: 'visible', label: 'div.form' },
      { overflowY: 'visible', label: 'main' },
    ])

    expect(scan).toEqual({ scrollerIndex: -1, clipperLabel: null })
  })

  it('находит ближайший скроллер и останавливается на нём', () => {
    const scan = scanAffixAncestors([
      { overflowY: 'visible', label: 'div.form' },
      { overflowY: 'auto', label: 'div.pane' },
      { overflowY: 'scroll', label: 'main' },
    ])

    expect(scan).toEqual({ scrollerIndex: 1, clipperLabel: null })
  })

  it('overlay считается скроллером наравне с auto и scroll', () => {
    expect(scanAffixAncestors([{ overflowY: 'overlay', label: 'div.pane' }]).scrollerIndex).toBe(0)
  })

  it('клипер ниже скроллера назван: внутри него sticky мёртв', () => {
    const scan = scanAffixAncestors([
      { overflowY: 'hidden', label: 'div[data-example-preview]' },
      { overflowY: 'auto', label: 'main' },
    ])

    expect(scan).toEqual({ scrollerIndex: 1, clipperLabel: 'div[data-example-preview]' })
  })

  it('clip ломает прилипание так же, как hidden', () => {
    expect(scanAffixAncestors([{ overflowY: 'clip', label: 'div.card' }]).clipperLabel).toBe('div.card')
  })

  it('называется первый клипер, а не последний: виноват ближайший', () => {
    const scan = scanAffixAncestors([
      { overflowY: 'visible', label: 'div.inner' },
      { overflowY: 'hidden', label: 'div.card' },
      { overflowY: 'hidden', label: 'div.outer' },
    ])

    expect(scan.clipperLabel).toBe('div.card')
  })

  it('клипер выше скроллера виновным не считается — обход туда не доходит', () => {
    const scan = scanAffixAncestors([
      { overflowY: 'auto', label: 'div.pane-scroll' },
      { overflowY: 'hidden', label: 'div.pane' },
    ])

    expect(scan).toEqual({ scrollerIndex: 0, clipperLabel: null })
  })

  it('auto, возникший из overflow-x: hidden, — рабочий скроллер, а не клипер', () => {
    // Вёрстка `overflow-x: hidden; overflow-y: visible` даёт вычисленный
    // `overflow-y: auto`. Проверка по классам объявила бы её сломанной.
    const scan = scanAffixAncestors([{ overflowY: 'auto', label: 'div.overflow-x-hidden' }])

    expect(scan).toEqual({ scrollerIndex: 0, clipperLabel: null })
  })
})
