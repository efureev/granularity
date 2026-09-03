import { describe, expect, it } from 'vitest'

import {
  activeSectionId,
  isScrollableOverflow,
  isScrolledToEnd,
  scrollSpyRootMargin,
  scrollSpyTargetTop,
} from '../scrollSpyGeometry'

describe('activeSectionId', () => {
  const rects = [
    { id: 'intro', top: -400 },
    { id: 'setup', top: -120 },
    { id: 'usage', top: 340 },
    { id: 'faq', top: 900 },
  ]

  it('пустой вход — сказать нечего', () => {
    expect(activeSectionId([], 0, false)).toBeNull()
    expect(activeSectionId([], 0, true)).toBeNull()
  })

  it('берёт последний раздел выше линии, а не самый видимый', () => {
    expect(activeSectionId(rects, 0, false)).toBe('setup')
  })

  it('линия ниже — активным становится следующий', () => {
    expect(activeSectionId(rects, 400, false)).toBe('usage')
  })

  it('все разделы ниже линии — читатель ещё в шапке', () => {
    expect(activeSectionId(rects, -500, false)).toBeNull()
  })

  it('раздел ровно на линии считается пройденным', () => {
    expect(activeSectionId([{ id: 'a', top: 100 }], 100, false)).toBe('a')
  })

  it('округление прокрутки не сбивает выбор на предыдущий раздел', () => {
    // После клика верх раздела ставится на линию, но браузер округляет смещение.
    expect(activeSectionId([{ id: 'a', top: 0 }, { id: 'b', top: 100.4 }], 100, false)).toBe('b')
  })

  it('раздел ниже линии на заметную величину не активен, даже если виден целиком', () => {
    expect(activeSectionId([{ id: 'a', top: 0 }, { id: 'b', top: 120 }], 100, false)).toBe('a')
  })

  it('порядок массива на ответ не влияет — решает геометрия', () => {
    const shuffled = [rects[3], rects[0], rects[2], rects[1]]

    expect(activeSectionId(shuffled, 0, false)).toBe('setup')
  })

  it('на дне активен последний раздел вопреки правилу линии', () => {
    // Раздел короче остатка скроллпорта до линии не доезжает никогда.
    expect(activeSectionId(rects, 0, true)).toBe('faq')
  })

  it('на дне при единственном разделе он же и активен', () => {
    expect(activeSectionId([{ id: 'only', top: 700 }], 0, true)).toBe('only')
  })
})

describe('scrollSpyRootMargin', () => {
  it('поджимает верх корня на отступ', () => {
    expect(scrollSpyRootMargin(112)).toBe('-112px 0px 0px 0px')
  })

  it('нулевой отступ оставляет корень нетронутым', () => {
    expect(scrollSpyRootMargin(0)).toBe('0px 0px 0px 0px')
  })

  it('дробное округляет, отрицательное и нечисло сводит к нулю', () => {
    expect(scrollSpyRootMargin(55.6)).toBe('-56px 0px 0px 0px')
    expect(scrollSpyRootMargin(-20)).toBe('0px 0px 0px 0px')
    expect(scrollSpyRootMargin(Number.NaN)).toBe('0px 0px 0px 0px')
  })
})

describe('scrollSpyTargetTop', () => {
  it('ставит верх раздела на линию активации', () => {
    // Скроллпорт прокручен на 200, раздел на 500 ниже его верха, отступ 64.
    expect(scrollSpyTargetTop(200, 500, 0, 64, 5000)).toBe(636)
  })

  it('учитывает, что скроллпорт сам смещён во вьюпорте', () => {
    expect(scrollSpyTargetTop(200, 500, 100, 64, 5000)).toBe(536)
  })

  it('раздел уже на линии — прокрутка остаётся прежней', () => {
    expect(scrollSpyTargetTop(300, 64, 0, 64, 5000)).toBe(300)
  })

  it('зажимает в ноль сверху и в предел прокрутки снизу', () => {
    expect(scrollSpyTargetTop(0, -900, 0, 64, 5000)).toBe(0)
    expect(scrollSpyTargetTop(4800, 900, 0, 0, 5000)).toBe(5000)
  })

  it('нечисловой предел не пускает прокрутку в минус', () => {
    expect(scrollSpyTargetTop(0, 500, 0, 0, Number.NaN)).toBe(0)
  })
})

describe('isScrollableOverflow', () => {
  it('прокручиваемые значения', () => {
    expect(isScrollableOverflow('auto')).toBe(true)
    expect(isScrollableOverflow('scroll')).toBe(true)
    expect(isScrollableOverflow('overlay')).toBe(true)
  })

  it('обрезающие и обычные — нет', () => {
    expect(isScrollableOverflow('hidden')).toBe(false)
    expect(isScrollableOverflow('clip')).toBe(false)
    expect(isScrollableOverflow('visible')).toBe(false)
  })
})

describe('isScrolledToEnd', () => {
  it('дно достигнуто', () => {
    expect(isScrolledToEnd(800, 800)).toBe(true)
    expect(isScrolledToEnd(799, 800)).toBe(true)
  })

  it('до дна ещё далеко', () => {
    expect(isScrolledToEnd(400, 800)).toBe(false)
  })

  it('содержимое короче скроллпорта дном не считается', () => {
    // Иначе последний раздел подсветился бы на странице, которая не прокручивается.
    expect(isScrolledToEnd(0, 0)).toBe(false)
    expect(isScrolledToEnd(0, 1)).toBe(false)
  })
})
