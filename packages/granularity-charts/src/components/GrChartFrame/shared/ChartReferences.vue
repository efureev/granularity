<script setup lang="ts">
import type { Rect } from '../../../chart/chartLayout'
import { dashArrayFor } from '../../../chart/chartPath'
import type { NormalizedReference, ReferenceMark } from '../../../chart/chartReference'
import { referenceMarks } from '../../../chart/chartReference'
import type { GrChartScale } from '../../../chart/chartScale'
import {
  frameLabelClass,
  REFERENCE_STROKE_WIDTH,
  referenceBandOpacity,
  referenceLabelFill,
  referenceStroke,
} from '../chartFrameStyles'

/**
 * Слой опорных линий и полос.
 *
 * Рисуется **под марками, но над сеткой**: порог, лежащий поверх данных,
 * перечёркивает ровно то, с чем его сравнивают, а уехав под сетку — теряется в
 * ней. Порядок держится местом слоя в `ChartFrame.vue`, а не `z-index`: в SVG
 * его нет, рисует порядок документа.
 *
 * `aria-hidden` не ставится и не нужен: весь `<svg>` в интерактивном режиме уже
 * скрыт от скринридера, а опоры доходят до него текстом — через
 * `aria-description` поверхности и `<tfoot>` скрытой таблицы.
 */
const props = defineProps<{
  references: readonly NormalizedReference[]
  plot: Rect
  xScale: GrChartScale
  yScale: GrChartScale
  /** Класс кегля: он парный к `fontSizePx`, иначе раскладка и рисунок разойдутся. */
  sizeClass: string
  fontSizePx: number
}>()

function marks(): ReferenceMark[] {
  return referenceMarks(props.references, {
    plot: props.plot,
    xScale: props.xScale,
    yScale: props.yScale,
    fontSizePx: props.fontSizePx,
  })
}

/** Линия у полосы обводит её границы, у одиночной опоры — она сама и есть. */
function edges(mark: ReferenceMark): { x1: number, y1: number, x2: number, y2: number }[] {
  if (mark.axis === 'y') {
    const levels = mark.band ? [mark.y, mark.y + mark.height] : [mark.y]

    return levels.map(y => ({ x1: mark.x, y1: y, x2: mark.x + mark.width, y2: y }))
  }

  const columns = mark.band ? [mark.x, mark.x + mark.width] : [mark.x]

  return columns.map(x => ({ x1: x, y1: mark.y, x2: x, y2: mark.y + mark.height }))
}
</script>

<template>
  <g data-gr-chart-references>
    <template v-for="mark in marks()" :key="mark.index">
      <rect
        v-if="mark.band"
        :data-gr-chart-reference-band="mark.index"
        :x="mark.x"
        :y="mark.y"
        :width="mark.width"
        :height="mark.height"
        :fill="mark.color ?? referenceStroke"
        :fill-opacity="referenceBandOpacity"
        stroke="none"
      />

      <line
        v-for="(edge, position) in edges(mark)"
        :key="position"
        :data-gr-chart-reference="mark.index"
        :x1="edge.x1"
        :y1="edge.y1"
        :x2="edge.x2"
        :y2="edge.y2"
        fill="none"
        :stroke="mark.color ?? referenceStroke"
        :stroke-width="REFERENCE_STROKE_WIDTH"
        :stroke-dasharray="dashArrayFor(mark.dash ?? 'dash', REFERENCE_STROKE_WIDTH)"
      />

      <text
        v-if="mark.label"
        :class="[frameLabelClass, sizeClass]"
        :data-gr-chart-reference-label="mark.index"
        :x="mark.labelX"
        :y="mark.labelY"
        :fill="referenceLabelFill"
        :text-anchor="mark.textAnchor"
      >
{{ mark.label }}
</text>
    </template>
  </g>
</template>
