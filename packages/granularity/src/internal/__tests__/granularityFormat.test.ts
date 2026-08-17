import { describe, expect, it } from 'vitest'

import { formatNumber, formatNumberToParts, splitLeadingSign } from '../granularityFormat'

describe('formatNumberToParts', () => {
  // Инвариант ECMA-402, на котором стоит вынос знака в отдельный узел: части
  // склеиваются обратно в ту же строку. Разряды не пересобираются вручную.
  it.each([
    ['en-US', 1234567.5],
    ['de-DE', 1234567.5],
    ['ru', -0.028],
    ['he-IL', -1234.5],
  ])('склейка частей равна форматированию (%s)', (locale, value) => {
    const options: Intl.NumberFormatOptions = { signDisplay: 'exceptZero', minimumFractionDigits: 1 }

    expect(formatNumberToParts(locale, value, options).map(part => part.value).join(''))
      .toBe(formatNumber(locale, value, options))
  })

  it('битый тег локали не роняет рендер, а сводится к en', () => {
    expect(formatNumberToParts('!!', 1234.5).map(part => part.value).join(''))
      .toBe(formatNumberToParts('en', 1234.5).map(part => part.value).join(''))
  })
})

describe('splitLeadingSign', () => {
  const parts = (...items: Array<[Intl.NumberFormatPartTypes, string]>): Intl.NumberFormatPart[] =>
    items.map(([type, value]) => ({ type, value }))

  it('отделяет ведущий плюс и минус', () => {
    expect(splitLeadingSign(parts(['plusSign', '+'], ['integer', '10'])))
      .toEqual({ sign: '+', rest: '10' })

    expect(splitLeadingSign(parts(['minusSign', '−'], ['integer', '10'])))
      .toEqual({ sign: '−', rest: '10' })
  })

  // Ноль под `exceptZero` и положительное под `auto` знаковой части не имеют.
  it('без знаковой части отдаёт запись целиком', () => {
    expect(splitLeadingSign(parts(['integer', '0'], ['decimal', ','], ['fraction', '00'])))
      .toEqual({ sign: '', rest: '0,00' })
  })

  it('невидимая метка направления уходит вместе со знаком', () => {
    expect(splitLeadingSign(parts(['literal', '‎'], ['minusSign', '-'], ['integer', '5'])))
      .toEqual({ sign: '‎-', rest: '5' })
  })

  // Живой локалью не воспроизводится — ради этой ветки функция и вынесена
  // отдельно: разрезать запись по догадке хуже, чем оставить её целой.
  it('знак после содержательной части не отделяется вовсе', () => {
    expect(splitLeadingSign(parts(['currency', '$'], ['minusSign', '-'], ['integer', '5'])))
      .toEqual({ sign: '', rest: '$-5' })
  })

  it('пустой список не роняет разбор', () => {
    expect(splitLeadingSign([])).toEqual({ sign: '', rest: '' })
  })
})
