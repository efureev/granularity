<script setup lang="ts" generic="TValue = Date">
import { computed, shallowRef, watch } from 'vue'

import { useGrComponentProp } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import type { NameWidth } from '../../chrono/chronoFormat'
import { formatPlainDate } from '../../chrono/chronoFormat'
import type { GrChronoAdapter, GrChronoAdapterName } from '../../chrono/chronoModel'
import { resolveChronoAdapter, toPlainDate } from '../../chrono/chronoModel'
import { differenceInDays } from '../../chrono/plainDate'
import type { RelativeUnit } from '../../chrono/relativeTime'
import { formatRelativeTime, selectRelativeAmount } from '../../chrono/relativeTime'
import { useChronoNow } from '../../composables/useChronoNow'

import { relativeTimeClass } from './grRelativeTimeStyles'

/**
 * GrRelativeTime — «3 минуты назад», «через 2 дня».
 *
 * Строку строит `Intl.RelativeTimeFormat`: названия единиц, склонение
 * числительного и «вчера» вместо «1 день назад» знает платформа. Своих строк у
 * компонента нет ни одной — он говорит на всех языках, которые знает движок.
 *
 * Разметка — `<time>` с машинным `datetime`: относительный текст читается
 * человеком, точный момент остаётся машине и остаётся в `title` для того, кто
 * захочет узнать дату.
 */
export interface GrRelativeTimeProps<T = Date> {
  /** Момент, о котором речь. Пустое значение рисует пустую метку. */
  value?: T | null
  /** Как значение приходит от потребителя. Тот же контракт, что у пикеров. */
  valueAdapter?: GrChronoAdapterName | GrChronoAdapter<T>
  /**
   * С чем сравнивать вместо «сейчас».
   *
   * Задан — часы не читаются вовсе: ни таймера, ни расхождения серверного
   * рендера с клиентским. Это же делает воспроизводимыми тесты и снимки.
   */
  base?: Date
  /**
   * Обновляться живьём. Такт компонент выбирает сам по текущей единице:
   * «3 месяца назад» незачем пересчитывать каждую секунду.
   */
  live?: boolean
  /**
   * Начиная со скольких дней показывать обычную дату вместо относительной.
   * `0` — никогда: «347 дней назад» останется как есть.
   */
  cutoff?: number
  /** Вид абсолютной даты — опциями `Intl`, а не строкой-паттерном. */
  format?: Intl.DateTimeFormatOptions
  /** Длина относительной строки: «3 месяца назад» против «3 мес. назад». */
  width?: NameWidth
  /** `'auto'` даёт «вчера», `'always'` — «1 день назад». */
  numeric?: Intl.RelativeTimeFormatNumeric
  /** Локаль показа. Не задана — из адаптера i18n приложения. */
  locale?: string
}

const props = withDefaults(defineProps<GrRelativeTimeProps<TValue>>(), {
  value: undefined,
  valueAdapter: undefined,
  base: undefined,
  format: undefined,
  locale: undefined,
  // Дефолты живут в резолвере: Vue подставил бы свои раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  live: undefined,
  cutoff: undefined,
  width: undefined,
  numeric: undefined,
})

defineSlots<{
  /** Своя разметка вместо текста: значения те же, что компонент рисует сам. */
  default?: (props: { text: string, absolute: string, datetime: string }) => unknown
}>()

const { locale: i18nLocale } = useGranularityTranslations()

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')
const resolvedWidth = useGrComponentProp('GrRelativeTime', 'width', () => props.width, 'long')
const resolvedNumeric = useGrComponentProp('GrRelativeTime', 'numeric', () => props.numeric, 'auto')
const resolvedCutoff = useGrComponentProp('GrRelativeTime', 'cutoff', () => props.cutoff, 0)
const resolvedLive = useGrComponentProp('GrRelativeTime', 'live', () => props.live, true)

const parsed = computed(() => (
  props.value === undefined || props.value === null
    ? null
    : resolveChronoAdapter<TValue>(props.valueAdapter).parse(props.value)
))

/**
 * Такт — от единицы, а не пропом.
 *
 * Секундная метка, обновляемая раз в минуту, показывает «только что» целую
 * минуту; месячная, обновляемая раз в секунду, будит вкладку шестьдесят раз в
 * минуту ради текста, который не изменится до конца недели.
 */
const TICK_BY_UNIT: Record<RelativeUnit, number> = {
  second: 5_000,
  minute: 30_000,
  hour: 300_000,
  day: 3_600_000,
  week: 3_600_000,
  month: 3_600_000,
  year: 3_600_000,
}

/**
 * Такт держится отдельным `ref`, а не выводится из единицы напрямую: единица
 * считается от «сейчас», «сейчас» приходит из тикера, а тикеру нужен такт —
 * замкнутый круг, в котором ни одно звено не успевает существовать. Разрывает
 * его наблюдатель ниже: он ставит новый такт **после** того, как единица уже
 * посчитана.
 *
 * Начальное значение — самое частое: ошибиться в сторону лишнего пересчёта
 * дешевле, чем показать секунды, застывшие на час.
 */
const tick = shallowRef(TICK_BY_UNIT.second)

// Часы читаются, только если компонент действительно живой: с `base` или без
// `live` нулевой такт означает «не подписываться», и таймер не заводится ни на
// секунду.
const clock = useChronoNow(() => (props.base || !resolvedLive.value ? 0 : tick.value))

/**
 * Момент отсчёта для нежившей метки. Снимается один раз на экземпляр: иначе
 * `computed` пересчитывал бы «сейчас» на каждый чужой рендер.
 */
const staticNow = new Date()

const now = computed(() => {
  if (props.base)
    return props.base

  return resolvedLive.value ? clock.value : staticNow
})

const amount = computed(() => (parsed.value ? selectRelativeAmount(now.value, parsed.value) : null))

watch(() => amount.value?.unit, (unit) => {
  tick.value = TICK_BY_UNIT[unit ?? 'second']
}, { immediate: true })

/** Значение старше порога — относительная строка перестаёт помогать. */
const beyondCutoff = computed(() => {
  const date = parsed.value
  if (!date || resolvedCutoff.value <= 0)
    return false

  return Math.abs(differenceInDays(toPlainDate(date), toPlainDate(now.value))) >= resolvedCutoff.value
})

const absolute = computed(() => (
  parsed.value ? formatPlainDate(resolvedLocale.value, toPlainDate(parsed.value), props.format ?? { dateStyle: 'long' }) : ''
))

const text = computed(() => {
  if (!amount.value)
    return ''
  if (beyondCutoff.value)
    return absolute.value

  return formatRelativeTime(resolvedLocale.value, amount.value, {
    numeric: resolvedNumeric.value,
    style: resolvedWidth.value,
  })
})

/** Машинная форма для `<time>`: момент на мировой линии, то есть UTC. */
const datetime = computed(() => parsed.value?.toISOString() ?? '')

/**
 * Показ выведен из часов — значит серверный рендер и клиентский разойдутся:
 * между ними всегда проходит время, а сервер к тому же обычно в UTC. Метка
 * `data-allow-mismatch` глушит ожидаемое расхождение точечно.
 *
 * Убирается это не флагом, а данными: передайте `base` — и рендер станет
 * детерминированным, а атрибут исчезнет сам.
 */
const fromClock = computed(() => props.base === undefined)
</script>

<template>
  <time
    data-gr-relative-time
    :class="relativeTimeClass"
    :datetime="datetime"
    :title="absolute"
    :data-allow-mismatch="fromClock ? 'children' : undefined"
  >
    <slot :text="text" :absolute="absolute" :datetime="datetime">{{ text }}</slot>
  </time>
</template>
