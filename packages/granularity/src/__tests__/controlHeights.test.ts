import { describe, expect, it } from 'vitest'

import { grFieldLookAttrs } from '../components/GrInput/grFieldLook'
import type { GrFieldKind } from '../components/GrInput/grFieldLook'
import { componentSheet, lookElement } from '@feugene/granularity-test-kit/vue'
import { GR_COMPONENT_SIZES, GR_CONTROL_HEIGHTS_PX } from '../components/shared/sizes'

/**
 * Одна линейка высот на все контролы формы.
 *
 * Высота у них выражена по-разному: рамку поля рисует лист `GrInput` по атрибутам
 * (`data-gr-field`, `data-gr-size`), и его ставят все поля ядра и спутников, а у
 * `GrSegmented` она складывается из высоты сегмента и поля дорожки с двух сторон.
 * Пока числа жили порознь, дорожка была выше поля той же ступени на 4–10 px,
 * причём по-разному на каждой ступени, — и увидеть это можно было только
 * поставив их рядом в одну строку.
 */
const TRACK_BORDER_PX = 2

function px(value: string): number {
  return Number.parseFloat(value)
}

const field = componentSheet('GrInput/GrInput.vue')
/** Высота рамки поля ступени `size` — точная у `line`, минимальная у `wrap`; в px. */
function fieldHeight(size: typeof GR_COMPONENT_SIZES[number], kind: GrFieldKind): number {
  const style = field.cascade(lookElement('div', grFieldLookAttrs({ size, kind })))
  return px(style[kind === 'line' ? 'height' : 'min-height']) * 16
}

const { cascade } = componentSheet('GrSegmented/GrSegmented.vue')
/** Переменные дорожки `GrSegmented` ступени `size` — из её листа. */
const segmentedTrack = (size: typeof GR_COMPONENT_SIZES[number]) => cascade(lookElement('div', { 'data-gr-segmented': '', 'data-gr-size': size }))

describe('линейка высот контролов', () => {
  for (const kind of ['line', 'wrap'] as const) {
    it(`рамка поля \`${kind}\` держит высоту шкалы на каждой ступени`, () => {
      for (const size of GR_COMPONENT_SIZES)
        expect(fieldHeight(size, kind), `${kind} / ${size}`).toBe(GR_CONTROL_HEIGHTS_PX[size])
    })
  }

  it('у многострочной рамки высоты ступени нет', () => {
    for (const size of GR_COMPONENT_SIZES) {
      const style = field.cascade(lookElement('div', grFieldLookAttrs({ size, kind: 'area' })))
      expect(style.height, size).toBeUndefined()
      expect(style['min-height'], size).toBeUndefined()
    }
  })

  it('внешняя высота дорожки GrSegmented равна высоте поля', () => {
    for (const size of GR_COMPONENT_SIZES) {
      const style = segmentedTrack(size)
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
      const style = segmentedTrack(size)
      const lineHeight = px(style['--gr-segmented-line-height']) * 16
      const content = lineHeight + 2 * px(style['--gr-segmented-item-py'])

      expect(content, `ступень ${size}`).toBeLessThanOrEqual(px(style['--gr-segmented-min-height']))
    }
  })
})
