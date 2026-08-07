<script setup lang="ts">
import { useGrComponentSize } from '../GrConfigProvider/context'
import { computed } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrSkeleton from '../GrSkeleton/GrSkeleton.vue'

import { formatStatisticValue } from './formatStatisticValue'

import {
  statisticAffixSizeBySize,
  statisticPlaceholderHeightBySize,
  statisticTitleClass,
  statisticTitleSizeBySize,
  statisticTrendClassByTrend,
  statisticTrendIconByTrend,
  statisticTrendSizeBySize,
  statisticValueClass,
  type GrStatisticSize,
  type GrStatisticTone,
  type GrStatisticTrend,
} from './grStatisticStyles'

export type {
  GrStatisticSize,
  GrStatisticTone,
  GrStatisticTrend,
} from './grStatisticStyles'
export type { GrStatisticFormatOptions } from './formatStatisticValue'

/**
 * Публичный GR-примитив «Statistic» — крупный числовой показатель с подписью,
 * префиксом/суффиксом и строкой динамики.
 *
 * Компонент презентационный: не грузит данные и не считает дельту, только
 * форматирует и подаёт. Форматирование — чистая функция `formatStatisticValue`.
 */
export interface GrStatisticProps {
  /** Значение показателя. Нечисловая строка выводится как есть. */
  value: number | string
  /** Подпись над значением. */
  title?: string
  /** Число знаков после запятой. */
  precision?: number
  /** Разделитель разрядов. Сильнее локали; без него и без локали — узкий пробел. */
  groupSeparator?: string
  /** Десятичный разделитель. Сильнее локали; без него и без локали — точка. */
  decimalSeparator?: string
  /**
   * BCP-47 локаль форматирования. Не задана — берётся из i18n-адаптера; нет и
   * адаптера — работают ручные разделители.
   */
  locale?: string
  /** Приписка перед значением (валюта, знак). */
  prefix?: string
  /** Приписка после значения (единица измерения, `%`). */
  suffix?: string
  /** UnoCSS-класс иконки слева от блока (например `i-lucide-users`). */
  icon?: string
  size?: GrStatisticSize
  /** Тон значения; точечно перекрывается `--gr-statistic-value-color`. */
  tone?: GrStatisticTone
  /** Направление динамики — задаёт цвет и иконку строки под значением. */
  trend?: GrStatisticTrend
  /** Текст динамики (например `+12,5% к прошлой неделе`). */
  trendText?: string
  /** Состояние загрузки: вместо значения — плейсхолдер. */
  loading?: boolean
}

const props = withDefaults(
  defineProps<GrStatisticProps>(),
  {
    title: undefined,
    precision: undefined,
    // Дефолты живут в `formatStatisticValue`: иначе «пользователь задал пробел»
    // было бы неотличимо от «сработал дефолт», и локаль не смогла бы победить.
    groupSeparator: undefined,
    decimalSeparator: undefined,
    locale: undefined,
    prefix: undefined,
    suffix: undefined,
    icon: undefined,
    size: undefined,
    tone: 'neutral',
    trend: undefined,
    trendText: undefined,
    loading: false,
  },
)

const { t, locale } = useGranularityTranslations()

const resolvedLocale = computed(() => props.locale ?? locale.value)

const formatted = computed(() => formatStatisticValue(props.value, {
  precision: props.precision,
  groupSeparator: props.groupSeparator,
  decimalSeparator: props.decimalSeparator,
  locale: resolvedLocale.value,
}))

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrStatistic' })

// Иконка направления `aria-hidden`, а «+12,5 %» само по себе рост от падения не
// отличает: направление доносит скрытая подпись.
const trendLabel = computed(() => {
  if (!props.trend) return undefined

  const labels = {
    up: () => t('gr.statistic.trendUp', 'Increase'),
    down: () => t('gr.statistic.trendDown', 'Decrease'),
    flat: () => t('gr.statistic.trendFlat', 'No change'),
  }

  return labels[props.trend]()
})
</script>

<template>
  <div data-gr-statistic class="flex items-start gap-3">
    <span
      v-if="icon || $slots.icon"
      data-gr-statistic-icon
      class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--gr-radius-lg)] bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]"
    >
      <slot name="icon">
        <span class="block h-4 w-4" :class="icon" aria-hidden="true" />
      </slot>
    </span>

    <div class="min-w-0">
      <div
        v-if="title || $slots.title"
        data-gr-statistic-title
        :class="[statisticTitleClass, statisticTitleSizeBySize[resolvedSize]]"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <!-- Плейсхолдер загрузки повторяет высоту строки значения, чтобы блок не прыгал. -->
      <div
        v-if="loading"
        data-gr-statistic-placeholder
        data-testid="gr-statistic-placeholder"
        class="mt-1"
        role="status"
        aria-busy="true"
      >
        <GrSkeleton
          width="6rem"
          :height="statisticPlaceholderHeightBySize[resolvedSize]"
          rounded="var(--gr-radius-md)"
        />
        <span class="sr-only">{{ t('gr.loading.defaultText', 'Loading...') }}</span>
      </div>

      <div
        v-else
        data-gr-statistic-value
        data-testid="gr-statistic-value"
        class="mt-0.5 flex items-baseline gap-1"
      >
        <span
          v-if="prefix || $slots.prefix"
          data-gr-statistic-prefix
          class="text-[var(--gr-muted-fg)]"
          :class="statisticAffixSizeBySize[resolvedSize]"
        >
          <slot name="prefix">{{ prefix }}</slot>
        </span>

        <span :class="statisticValueClass({ size: resolvedSize, tone })">
          <slot>{{ formatted }}</slot>
        </span>

        <span
          v-if="suffix || $slots.suffix"
          data-gr-statistic-suffix
          class="text-[var(--gr-muted-fg)]"
          :class="statisticAffixSizeBySize[resolvedSize]"
        >
          <slot name="suffix">{{ suffix }}</slot>
        </span>
      </div>

      <div
        v-if="trend || trendText || $slots.trend"
        data-gr-statistic-trend
        data-testid="gr-statistic-trend"
        class="mt-1 inline-flex items-center gap-1"
        :class="[statisticTrendSizeBySize[resolvedSize], statisticTrendClassByTrend[trend ?? 'flat']]"
      >
        <span v-if="trendLabel" data-gr-statistic-trend-label class="sr-only">{{ trendLabel }}</span>

        <slot name="trend">
          <span
            v-if="trend"
            class="block h-3.5 w-3.5"
            :class="statisticTrendIconByTrend[trend]"
            aria-hidden="true"
          />
          <span>{{ trendText }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>
