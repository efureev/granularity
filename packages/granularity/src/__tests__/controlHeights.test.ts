import { describe, expect, it } from 'vitest'

import { selectSizeClassBySize } from '../components/GrSelect/grSelectStyles'
import { triggerSizeClassBySize } from '../components/GrColorPicker/grColorPickerStyles'
import { shellHeightClass as inputHeights } from '../components/GrInput/grInputStyles'
import { shellHeightClass as numberInputHeights } from '../components/GrNumberInput/grNumberInputStyles'
import { rootSizeStyles as segmentedSizes } from '../components/GrSegmented/grSegmentedStyles'
import { sizeClassBySize as treeSelectSizes } from '../components/GrTreeSelect/grTreeSelectStyles'
import { GR_COMPONENT_SIZES, GR_CONTROL_HEIGHTS_PX } from '../components/shared/sizes'

/**
 * Одна линейка высот на все контролы формы.
 *
 * Высота у них выражена по-разному: у поля это утилита `h-10`, у `GrSegmented`
 * она складывается из высоты сегмента и поля дорожки с двух сторон. Пока числа
 * жили порознь, дорожка была выше поля той же ступени на 4–10 px, причём
 * по-разному на каждой ступени, — и увидеть это можно было только поставив их
 * рядом в одну строку.
 */
function heightFromUtility(classes: string): number {
  const match = /\bh-(\d+)\b/.exec(classes)
  if (!match)
    throw new Error(`в «${classes}» нет утилиты высоты`)

  // Шаг шкалы uno — 4px: `h-10` это 40px.
  return Number(match[1]) * 4
}

const TRACK_BORDER_PX = 2

function px(value: string): number {
  return Number.parseFloat(value)
}

const utilityControls: Record<string, Record<string, string>> = {
  GrInput: inputHeights,
  GrSelect: selectSizeClassBySize,
  GrNumberInput: numberInputHeights,
  GrTreeSelect: treeSelectSizes,
  GrColorPicker: triggerSizeClassBySize,
}

describe('линейка высот контролов', () => {
  for (const [name, map] of Object.entries(utilityControls)) {
    it(`${name} держит высоту шкалы на каждой ступени`, () => {
      for (const size of GR_COMPONENT_SIZES) {
        expect(heightFromUtility(map[size]), `${name} / ${size}`)
          .toBe(GR_CONTROL_HEIGHTS_PX[size])
      }
    })
  }

  it('внешняя высота дорожки GrSegmented равна высоте поля', () => {
    for (const size of GR_COMPONENT_SIZES) {
      const style = segmentedSizes[size]
      // Рамка входит в ступень, а не прибавляется к ней: у `GrSelect` рамка и
      // высота лежат на одном элементе, и дорожка обязана считать так же. Без
      // этого слагаемого дорожка выходила на 2 px выше — замерено линейкой на
      // странице Foundations (`30/28/30/30/28` на `xs`).
      const outer = px(style['--gr-segmented-min-height'])
        + 2 * px(style['--gr-segmented-padding'])
        + TRACK_BORDER_PX

      expect(outer, `ступень ${size}`).toBe(GR_CONTROL_HEIGHTS_PX[size])
    }
  })

  it('содержимое сегмента не перебивает его высоту', () => {
    // Иначе `min-height` перестаёт задавать высоту, дорожка вырастает по
    // контенту, и линейка расходится обратно — незаметно для предыдущей проверки.
    for (const size of GR_COMPONENT_SIZES) {
      const style = segmentedSizes[size]
      const lineHeight = px(style['--gr-segmented-line-height']) * 16
      const content = lineHeight + 2 * px(style['--gr-segmented-item-py'])

      expect(content, `ступень ${size}`).toBeLessThanOrEqual(px(style['--gr-segmented-min-height']))
    }
  })
})
