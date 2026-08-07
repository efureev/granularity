<script setup lang="ts">
import { computed } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  countBaseClass,
  dotBaseClass,
  dotPlacementClass,
  formatBadgeValue,
  placementClass,
  rootClass,
  toneClass,
  type GrBadgeWrapPlacement,
  type GrBadgeWrapTone,
} from './grBadgeWrapStyles'

export type { GrBadgeWrapPlacement, GrBadgeWrapTone } from './grBadgeWrapStyles'

/**
 * GrBadgeWrap — обёртка, вешающая на потомка счётчик или точку-индикатор.
 *
 * Число объявляется скринридеру: «3» без единицы измерения ничего не значит,
 * поэтому рядом с бейджем идёт визуально скрытая подпись.
 */
export interface GrBadgeWrapProps {
  value?: string | number
  /** Точка вместо числа: чистая декорация, если не задан `ariaLabel`. */
  dot?: boolean
  /** Порог: значения больше него рисуются как «{max}+». */
  max?: number
  /** Показывать ли нулевое значение. По умолчанию ноль скрыт. */
  showZero?: boolean
  tone?: GrBadgeWrapTone
  placement?: GrBadgeWrapPlacement
  /** Подпись счётчика для скринридера. Не задана — берётся из локали. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<GrBadgeWrapProps>(), {
  value: undefined,
  dot: false,
  max: undefined,
  showZero: false,
  tone: 'danger',
  placement: 'top-right',
  ariaLabel: undefined,
})

const { t } = useGranularityTranslations()

const showCount = computed(() => {
  if (props.dot || props.value === undefined) return false
  return props.value !== 0 || props.showZero
})

/** Видимый текст: «120» при `max=99` превращается в «99+». */
const displayValue = computed(() => formatBadgeValue(props.value ?? '', props.max))

/**
 * Озвучивается настоящее значение, а не обрезанное: «99 плюс» пользователю
 * ничего не говорит, «120 непрочитанных» — говорит.
 */
const countLabel = computed(() => props.ariaLabel
  ?? t('gr.badgeWrap.count', '{count} new', { count: props.value, n: props.value }))
</script>

<template>
  <span :class="rootClass">
    <slot />

    <template v-if="dot">
      <span
        data-gr-badge-wrap-dot
        :class="[dotBaseClass, dotPlacementClass[placement], toneClass[tone]]"
        aria-hidden="true"
      />
      <!-- Точка сама по себе смысла не несёт; подпись появляется только когда
           потребитель объяснил, о чём она. -->
      <span v-if="ariaLabel" data-gr-badge-wrap-label class="sr-only">{{ ariaLabel }}</span>
    </template>

    <template v-else-if="showCount">
      <span
        data-gr-badge-wrap-count
        :class="[countBaseClass, placementClass[placement], toneClass[tone]]"
        aria-hidden="true"
      >{{ displayValue }}</span>
      <span data-gr-badge-wrap-label class="sr-only">{{ countLabel }}</span>
    </template>
  </span>
</template>
