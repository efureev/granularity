import { computed, type ComputedRef, onBeforeUnmount, ref, type Ref, watch } from 'vue'

import type { Rect } from '../chart/chartLayout'
import type { ChartData, GrChartXValue, NormalizedPoint } from '../chart/chartModel'
import type { GrChartSeriesStyle } from '../chart/chartSeriesStyle'
import { type GrChartScale, nearestIndex, scaleForAxis } from '../chart/chartScale'

/**
 * Активная точка и её положение на холсте.
 *
 * Ключевое решение — **хит-тест по координате указателя, а не событиями на
 * марках**. Событие на каждом `<circle>` не сработало бы там, где это нужнее
 * всего: по линии толщиной в два пикселя мышью не попасть, а две тысячи
 * слушателей никому не нужны. Тот же расчёт переживёт переход на canvas без
 * единой правки — у него `mouseenter` на точке нет вовсе.
 */

export interface GrChartActiveSeriesValue {
  id: string
  label: string
  value: number | null
  point: NormalizedPoint | null
  style: GrChartSeriesStyle
  /** Ось серии: у графика с двумя осями значения приходят из разных шкал. */
  axis: 'left' | 'right'
}

export interface GrChartActivePoint {
  /** Индекс в `data.positions`. */
  index: number
  x: number
  raw: GrChartXValue
  series: GrChartActiveSeriesValue[]
}

/**
 * Что известно правилу попадания о системе координат.
 *
 * Одной области построения мало: круг считает угол от её центра, а столбцы —
 * попадание в полосу категории, ширина которой живёт в шкале и зависит от её
 * отступов. Собирать шкалу заново в компоненте значило бы повторить настройки
 * рамы и однажды разойтись с ними.
 */
export interface ChartHitContext {
  plot: Rect
  xScale: GrChartScale
  yScale: GrChartScale
  /**
   * Вторая ось значений при `dualAxis`, иначе `null`.
   *
   * Компонент, который считает собственный якорь, обязан взять её отсюда, а не
   * строить заново: «красивый» домен правой оси рама округляет по-своему, и
   * пересчёт разошёлся бы с рисунком на несколько пикселей.
   */
  yScaleRight: GrChartScale | null
}

export interface UseChartTooltipOptions {
  data: () => ChartData
  xScale: () => GrChartScale
  yScale: () => GrChartScale
  /** Шкала правой оси; `null` — ось одна. */
  yScaleRight?: () => GrChartScale | null
  plot: () => Rect
  /** Элемент, по которому считается координата указателя. */
  surface: Ref<HTMLElement | null>
  enabled?: () => boolean
  closeDelayMs?: number
  /**
   * Своё правило попадания: координаты внутри поверхности → индекс позиции,
   * `-1` — мимо.
   *
   * По умолчанию берётся ближайшая по абсциссе точка — это верно для всего,
   * что раскладывается по оси. У круга попадание **угловое**, и декартово
   * правило ответило бы неверно всегда, кроме случайных совпадений.
   */
  hitTest?: (point: { x: number, y: number }, context: ChartHitContext) => number
  /**
   * Своё место якоря тултипа. `null` — якорь спрятан.
   *
   * Дефолт садится на верхнее значение столбика точек; у круга такого столбика
   * нет вовсе, и якорь уехал бы в случайную точку холста.
   */
  anchor?: (index: number, context: ChartHitContext) => { x: number, y: number } | null
}

export interface UseChartTooltipReturn {
  open: Ref<boolean>
  activeIndex: Ref<number | null>
  active: ComputedRef<GrChartActivePoint | null>
  /** Стиль якоря тултипа — HTML-див нулевого размера над точкой. */
  anchorStyle: ComputedRef<Record<string, string>>
  setActive: (index: number | null) => void
  onPointerMove: (event: PointerEvent) => void
  onPointerLeave: () => void
  close: () => void
}

const DEFAULT_CLOSE_DELAY = 80

export function useChartTooltip(options: UseChartTooltipOptions): UseChartTooltipReturn {
  const activeIndex = ref<number | null>(null)

  function hitContext(): ChartHitContext {
    return {
      plot: options.plot(),
      xScale: options.xScale(),
      yScale: options.yScale(),
      yScaleRight: options.yScaleRight?.() ?? null,
    }
  }
  const open = ref(false)
  let closeTimer: ReturnType<typeof setTimeout> | null = null

  function cancelClose(): void {
    if (closeTimer !== null) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
  }

  const active = computed<GrChartActivePoint | null>(() => {
    const index = activeIndex.value

    if (index === null)
      return null

    const data = options.data()
    const x = data.positions[index]

    if (x === undefined)
      return null

    const first = data.series.find(series => !series.hidden && series.byX.has(x))
    const sample = first?.byX.get(x)

    return {
      index,
      x,
      raw: sample?.raw ?? x,
      series: data.series
        .filter(series => !series.hidden)
        .map((series) => {
          const point = series.byX.get(x) ?? null

          return {
            id: series.id,
            label: series.label,
            value: point?.y ?? null,
            point,
            style: series.style,
            axis: series.axis,
          }
        }),
    }
  })

  const anchorStyle = computed<Record<string, string>>(() => {
    const point = active.value
    const plot = options.plot()

    const hidden: Record<string, string> = { display: 'none' }

    if (!point)
      return hidden

    if (options.anchor) {
      const custom = options.anchor(point.index, hitContext())

      if (!custom)
        return hidden

      return {
        position: 'absolute',
        left: `${custom.x}px`,
        top: `${custom.y}px`,
        width: '0px',
        height: '0px',
        pointerEvents: 'none',
      }
    }

    // Якорь садится на **верх нарисованного** в этой позиции: тултип всплывает
    // над тем, что человек и так рассматривает. У стопки верх — это вершина
    // полосы (`stackTop`), а не наибольшее из значений: по значению панель
    // уехала бы внутрь столбца и накрыла бы ровно то, что показывает.
    // Пиксель считается на **своей** шкале серии, и только потом берётся
    // верхний. Сравнивать значения с разных осей нельзя: сорок тысяч рублей и
    // двенадцать штук — не «сорок тысяч выше», а разные единицы.
    const right = options.yScaleRight?.() ?? null
    const tops = point.series
      .map((series) => {
        const value = series.point?.stackTop ?? series.value

        return value === null ? null : scaleForAxis(series.axis, options.yScale(), right).scale(value)
      })
      .filter((value): value is number => value !== null)

    const top = tops.length > 0 ? Math.min(...tops) : plot.y + plot.height / 2

    const style: Record<string, string> = {
      position: 'absolute',
      left: `${options.xScale().scale(point.x)}px`,
      top: `${top}px`,
      width: '0px',
      height: '0px',
      pointerEvents: 'none',
    }

    return style
  })

  function setActive(index: number | null): void {
    cancelClose()
    activeIndex.value = index
    open.value = index !== null && (options.enabled?.() ?? true)
  }

  function onPointerMove(event: PointerEvent): void {
    if (options.enabled?.() === false)
      return

    const element = options.surface.value

    if (!element)
      return

    const rect = element.getBoundingClientRect()
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    const index = options.hitTest
      ? options.hitTest(point, hitContext())
      : nearestIndex(options.data().positions, options.xScale(), point.x)

    setActive(index === -1 ? null : index)
  }

  function close(): void {
    cancelClose()
    open.value = false
    activeIndex.value = null
  }

  function onPointerLeave(): void {
    cancelClose()
    // Небольшая задержка: между областью построения и панелью тултипа курсор
    // проходит через зазор, и мгновенное закрытие мигало бы на каждом переходе.
    closeTimer = setTimeout(close, options.closeDelayMs ?? DEFAULT_CLOSE_DELAY)
  }

  // Сменились данные — прежний индекс адресует чужую точку. Молча показывать
  // соседнее значение хуже, чем закрыться.
  watch(() => options.data(), () => close())

  onBeforeUnmount(cancelClose)

  return { open, activeIndex, active, anchorStyle, setActive, onPointerMove, onPointerLeave, close }
}
