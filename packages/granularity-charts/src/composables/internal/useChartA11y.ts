import type { Ref } from 'vue'

import type { ChartData } from '../../chart/chartModel'

/**
 * Клавиатура по точкам и объявление активной.
 *
 * `useRovingFocus` ядра здесь **не используется, и это осознанно**: примитив
 * раздаёт `tabindex` по многим элементам, а у графика по построению одна
 * остановка `Tab` — две тысячи остановок это не паттерн доступности, а
 * вредительство. Фокус живёт на прозрачном оверлее, а «где я» несёт
 * объявление в живой регион.
 */
/**
 * Настройки карты клавиш под систему координат.
 *
 * Дефолты воспроизводят декартово поведение буквально: ни один существующий
 * график их не передаёт, и передавать не должен.
 */
export interface ChartKeyboardOptions {
  /**
   * По чему ходят стрелки.
   *
   * `'both'` — `←→` по позициям, `↑↓` по сериям (дефолт).
   * `'positions'` — обе пары по позициям: у воронки ступени идут сверху вниз,
   * и `↑↓` там значит ровно то же, что `←→`.
   */
  axes?: 'both' | 'positions'
  /**
   * Кольцевать переход по сериям. Дефолт — да.
   *
   * У матрицы `false`: перескок с последней строки на первую дезориентирует —
   * читатель теряет, в какой он строке, а сказать ему об этом нечем.
   */
  wrapSeries?: boolean
  /**
   * `PageUp`/`PageDown`: десятая часть ряда (дефолт) или край **по сериям** —
   * то есть край колонки у матрицы.
   */
  pageMode?: 'positions' | 'series'
}

export interface UseChartA11yOptions {
  data: () => ChartData
  activeIndex: Ref<number | null>
  /** Индекс серии, по которой идёт чтение при нескольких сериях. */
  activeSeriesIndex: Ref<number>
  setActive: (index: number | null) => void
  announce: (message: string) => void
  describe: (index: number, seriesIndex: number) => string
  onActivate?: (index: number) => void
  keyboard?: () => ChartKeyboardOptions | undefined
}

export interface UseChartA11yReturn {
  /** `true` — клавиша обработана и событие гасится. */
  onKeydown: (event: KeyboardEvent) => boolean
  announceActive: () => void
}

/** Шаг `PageUp`/`PageDown` — десятая часть ряда, но не меньше одной точки. */
function pageStep(total: number): number {
  return Math.max(1, Math.round(total / 10))
}

export function useChartA11y(options: UseChartA11yOptions): UseChartA11yReturn {
  function visibleSeries() {
    return options.data().series.filter(series => !series.hidden)
  }

  function announceActive(): void {
    const index = options.activeIndex.value

    if (index === null)
      return

    options.announce(options.describe(index, options.activeSeriesIndex.value))
  }

  function moveTo(index: number): boolean {
    const total = options.data().positions.length

    if (total === 0)
      return false

    options.setActive(Math.min(total - 1, Math.max(0, index)))
    announceActive()

    return true
  }

  /** Переход по сериям: у матрицы это строка, и кольцевать его нельзя. */
  function moveSeries(delta: number, edge: boolean): boolean {
    const series = visibleSeries()

    if (series.length < 2)
      return false

    const current = options.activeSeriesIndex.value
    const last = series.length - 1

    if (edge)
      options.activeSeriesIndex.value = delta > 0 ? last : 0
    else if (options.keyboard?.()?.wrapSeries === false)
      options.activeSeriesIndex.value = Math.min(last, Math.max(0, current + delta))
    else
      options.activeSeriesIndex.value = (current + delta + series.length) % series.length

    if (options.activeIndex.value === null)
      return moveTo(0)

    announceActive()

    return true
  }

  function onKeydown(event: KeyboardEvent): boolean {
    const total = options.data().positions.length

    if (total === 0)
      return false

    const current = options.activeIndex.value
    const keyboard = options.keyboard?.()
    const alongPositions = keyboard?.axes === 'positions'
    const pageBySeries = keyboard?.pageMode === 'series'

    switch (event.key) {
      case 'ArrowRight':
        // Первое нажатие ставит курсор в начало ряда, а не «на следующую после
        // никакой»: иначе первое движение с клавиатуры не даёт ничего.
        return moveTo(current === null ? 0 : current + 1)
      case 'ArrowLeft':
        return moveTo(current === null ? total - 1 : current - 1)
      case 'Home':
        return moveTo(0)
      case 'End':
        return moveTo(total - 1)
      case 'PageDown':
        return pageBySeries ? moveSeries(1, true) : moveTo((current ?? 0) + pageStep(total))
      case 'PageUp':
        return pageBySeries ? moveSeries(-1, true) : moveTo((current ?? 0) - pageStep(total))
      case 'ArrowDown':
        return alongPositions ? moveTo(current === null ? 0 : current + 1) : moveSeries(1, false)
      case 'ArrowUp':
        return alongPositions ? moveTo(current === null ? total - 1 : current - 1) : moveSeries(-1, false)
      case 'Enter':
      case ' ':
        if (current === null)
          return false

        options.onActivate?.(current)

        return true
      case 'Escape':
        if (current === null)
          return false

        options.setActive(null)

        return true
      default:
        return false
    }
  }

  return { onKeydown, announceActive }
}
