<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

import { useGrComponentProp } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import type { NameWidth } from '../../chrono/chronoFormat'
import type { DurationUnit } from '../../chrono/duration'
import { durationToIso, formatDuration, selectDurationParts } from '../../chrono/duration'
import { useChronoNow } from '../../composables/useChronoNow'

import { durationClass } from './grDurationStyles'

/**
 * GrDuration — «2 ч 30 мин»: сколько длилось, а не когда случилось.
 *
 * Имена единиц и склонение числительного знает платформа, поэтому своих строк
 * у компонента нет ни одной — он говорит на всех языках, которые знает движок.
 *
 * Разметка — `<time>` с машинным `datetime` в формате ISO 8601: сокращённый
 * текст читает человек, точная длина остаётся машине.
 */
export interface GrDurationProps {
  /**
   * Что мерить. Три формы, каждая различима по типу:
   *
   * - **число** — секунды;
   * - **пара дат** — промежуток между ними;
   * - **одна дата** — от неё до «сейчас»; такая метка живая и тикает.
   */
  value?: number | Date | readonly [Date, Date] | null
  /**
   * С чем сравнивать вместо «сейчас» — для формы с одной датой.
   *
   * Задан — часы не читаются вовсе: ни таймера, ни расхождения серверного
   * рендера с клиентским. Это же делает воспроизводимыми тесты и снимки.
   */
  base?: Date
  /** Обновляться живьём. Такт компонент выбирает сам по младшей показанной единице. */
  live?: boolean
  /** Сколько единиц показывать подряд: `2` даёт «2 ч 30 мин». */
  maxUnits?: number
  /** Крупнее этой единицы не дробить: остаток копится в ней. */
  largestUnit?: DurationUnit
  /** Мельче этой не спускаться. */
  smallestUnit?: DurationUnit
  /** Длина имён единиц: «2 часа 30 минут» против «2 ч 30 мин». */
  width?: NameWidth
  /** Локаль показа. Не задана — из адаптера i18n приложения. */
  locale?: string
}

const props = withDefaults(defineProps<GrDurationProps>(), {
  value: undefined,
  base: undefined,
  locale: undefined,
  // Дефолты живут в резолвере: Vue подставил бы свои раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  live: undefined,
  maxUnits: undefined,
  largestUnit: undefined,
  smallestUnit: undefined,
  width: undefined,
})

defineSlots<{
  /** Своя разметка вместо текста: значения те же, что компонент рисует сам. */
  default?: (props: { text: string, datetime: string, seconds: number }) => unknown
}>()

const { locale: i18nLocale } = useGranularityTranslations()

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')
const resolvedWidth = useGrComponentProp('GrDuration', 'width', () => props.width, 'short')
const resolvedMaxUnits = useGrComponentProp('GrDuration', 'maxUnits', () => props.maxUnits, 2)
const resolvedLargestUnit = useGrComponentProp('GrDuration', 'largestUnit', () => props.largestUnit, 'day')
const resolvedSmallestUnit = useGrComponentProp('GrDuration', 'smallestUnit', () => props.smallestUnit, 'second')
const resolvedLive = useGrComponentProp('GrDuration', 'live', () => props.live, true)

/**
 * Такт — от младшей показанной единицы, а не пропом.
 *
 * Метка в минутах, обновляемая раз в секунду, будит вкладку шестьдесят раз
 * ради текста, который не изменится ещё минуту.
 */
const TICK_BY_UNIT: Record<DurationUnit, number> = {
  second: 1000,
  minute: 30_000,
  hour: 300_000,
  day: 3_600_000,
}

/**
 * Такт держится отдельным `ref` по той же причине, что у `GrRelativeTime`:
 * единица считается от «сейчас», «сейчас» приходит из тикера, а тикеру нужен
 * такт. Круг разрывает наблюдатель ниже — он ставит такт **после** того, как
 * единица посчитана.
 */
const tick = shallowRef(TICK_BY_UNIT.second)

/** Живой счёт нужен только форме с одной датой: у числа и пары длина уже задана. */
const countsToNow = computed(() => props.value instanceof Date)

const clock = useChronoNow(() => (
  props.base || !resolvedLive.value || !countsToNow.value ? 0 : tick.value
))

/** Момент отсчёта для нежившей метки — снимается один раз на экземпляр. */
const staticNow = new Date()

const now = computed(() => {
  if (props.base) return props.base

  return resolvedLive.value ? clock.value : staticNow
})

const seconds = computed(() => {
  const value = props.value

  if (value === undefined || value === null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (value instanceof Date) return (now.value.getTime() - value.getTime()) / 1000

  return (value[1].getTime() - value[0].getTime()) / 1000
})

const parts = computed(() => (seconds.value === null
  ? null
  : selectDurationParts(seconds.value, {
      maxUnits: resolvedMaxUnits.value,
      largestUnit: resolvedLargestUnit.value,
      smallestUnit: resolvedSmallestUnit.value,
    })))

watch(parts, (value) => {
  const shown = value ? Object.keys(value) as DurationUnit[] : []

  tick.value = TICK_BY_UNIT[shown.at(-1) ?? 'second']
}, { immediate: true })

const text = computed(() => (seconds.value === null
  ? ''
  : formatDuration(resolvedLocale.value, seconds.value, {
      style: resolvedWidth.value,
      maxUnits: resolvedMaxUnits.value,
      largestUnit: resolvedLargestUnit.value,
      smallestUnit: resolvedSmallestUnit.value,
    })))

/**
 * Машинная форма считается по полному значению, а не по показанным единицам:
 * `maxUnits` сокращает текст для человека, разметка обязана остаться точной.
 */
const datetime = computed(() => (seconds.value === null ? '' : durationToIso(seconds.value)))

/**
 * Показ выведен из часов — значит серверный рендер и клиентский разойдутся:
 * между ними всегда проходит время. Метка `data-allow-mismatch` глушит
 * ожидаемое расхождение точечно, и убирается оно данными: передайте `base`.
 */
const fromClock = computed(() => countsToNow.value && props.base === undefined)
</script>

<template>
  <time
    data-gr-duration
    :class="durationClass"
    :datetime="datetime"
    :data-allow-mismatch="fromClock ? 'children' : undefined"
  >
    <slot :text="text" :datetime="datetime" :seconds="seconds ?? 0">{{ text }}</slot>
  </time>
</template>
