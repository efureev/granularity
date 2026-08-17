<script setup lang="ts">
import { computed } from 'vue'

import { formatNumber } from '../../internal/granularityFormat'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'

import IconMinus from '~icons/lucide/minus'
import IconTrendingDown from '~icons/lucide/trending-down'
import IconTrendingUp from '~icons/lucide/trending-up'

import { deltaDirection, deltaTone, type GrDeltaPolarity, type GrDeltaTone } from './deltaTone'
import {
  deltaArrowClass,
  deltaArrowSizeClass,
  deltaEmptyClass,
  deltaRootClass,
  deltaSizeClass,
  deltaSuffixClass,
  deltaToneClass,
} from './grDeltaStyles'

import type { GrComponentSize } from '../shared/sizes'

export type { GrDeltaPolarity, GrDeltaTone } from './deltaTone'

/**
 * Величина со знаком и тоном **внутри строки текста**: «Дельта: +$0.004».
 *
 * Компонент презентационный: дельту не считает и периоды не сравнивает —
 * «к чему сравнивать» знает приложение. Блочная плитка показателя — `GrStatistic`.
 */
export interface GrDeltaProps {
  /** Величина. `null` — её нет; это не ноль. */
  value: number | null
  /** Знаков после запятой. Не задано — как отдаст локаль. */
  precision?: number
  /** Приписка перед числом: валюта, единица. */
  prefix?: string
  /** Приписка после числа: `%`, `мс`. */
  suffix?: string
  /**
   * Что считать хорошим. Для выручки рост — успех, для себестоимости и времени
   * отклика — наоборот; без этого компонент врал бы в половине случаев.
   */
  polarity?: GrDeltaPolarity
  /** Ставить `+` у положительных. Минус подставляет `Intl` сам. */
  showSign?: boolean
  /** Стрелка направления. Декоративна: направление уже в знаке. */
  showArrow?: boolean
  /** Чем печатать отсутствующую величину. */
  emptyText?: string
  /** Локаль форматирования. Не задана — локаль i18n-адаптера. */
  locale?: string
  size?: GrComponentSize
}

const props = withDefaults(defineProps<GrDeltaProps>(), {
  // Дефолты живут в резолверах ниже: Vue подставил бы свой раньше, чем
  // компонент заглянет в `GrConfigProvider`.
  precision: undefined,
  prefix: undefined,
  suffix: undefined,
  polarity: undefined,
  showSign: undefined,
  showArrow: undefined,
  emptyText: undefined,
  locale: undefined,
  size: undefined,
})

const { locale } = useGranularityTranslations()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrDelta' })
const resolvedLocale = computed(() => props.locale ?? locale.value ?? 'en')
const resolvedPolarity = useGrComponentProp('GrDelta', 'polarity', () => props.polarity, 'positive-good')
const resolvedShowSign = useGrComponentProp('GrDelta', 'showSign', () => props.showSign, true)
const resolvedShowArrow = useGrComponentProp('GrDelta', 'showArrow', () => props.showArrow, false)
const resolvedEmptyText = useGrComponentProp('GrDelta', 'emptyText', () => props.emptyText, '—')

const isEmpty = computed(() => props.value === null || props.value === undefined)

const tone = computed<GrDeltaTone>(() => (
  isEmpty.value ? 'neutral' : deltaTone(props.value as number, resolvedPolarity.value)
))

const direction = computed(() => (isEmpty.value ? 'flat' : deltaDirection(props.value as number)))

/**
 * Знак — префикс форматирования, а не склейка строки. `'+' + value` уже ломало
 * `GrStatistic`: строка `'+10'` разбирается как число, и разряды теряются.
 */
const formatted = computed(() => {
  if (isEmpty.value) return resolvedEmptyText.value

  return formatNumber(resolvedLocale.value, props.value as number, {
    signDisplay: resolvedShowSign.value ? 'exceptZero' : 'auto',
    ...(props.precision === undefined
      ? {}
      : { minimumFractionDigits: props.precision, maximumFractionDigits: props.precision }),
  })
})

const arrowIcon = computed(() => {
  if (direction.value === 'up') return IconTrendingUp
  if (direction.value === 'down') return IconTrendingDown
  return IconMinus
})

const rootClass = computed(() => [
  deltaRootClass,
  deltaSizeClass[resolvedSize.value],
  isEmpty.value ? deltaEmptyClass : deltaToneClass[tone.value],
].join(' '))
</script>

<template>
  <span data-gr-delta :data-tone="isEmpty ? undefined : tone" :class="rootClass">
    <component
      :is="arrowIcon"
      v-if="resolvedShowArrow && !isEmpty"
      data-gr-delta-arrow
      :class="[deltaArrowClass, deltaArrowSizeClass[resolvedSize]]"
      aria-hidden="true"
    />

    <span v-if="prefix && !isEmpty" data-gr-delta-prefix>{{ prefix }}</span>
    <span data-gr-delta-value>{{ formatted }}</span>
    <span v-if="suffix && !isEmpty" data-gr-delta-suffix :class="deltaSuffixClass">{{ suffix }}</span>
  </span>
</template>
