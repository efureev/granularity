<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  countBaseClass,
  dotBaseClass,
  dotPlacementClass,
  formatBadgeValue,
  isBadgeWrapPulse,
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
  /** Отмечать ли появление и рост **счётчика** анимацией. Точке анимировать нечего. */
  animate?: boolean
}

const props = withDefaults(defineProps<GrBadgeWrapProps>(), {
  value: undefined,
  dot: false,
  max: undefined,
  showZero: false,
  tone: 'danger',
  placement: 'top-right',
  ariaLabel: undefined,
  animate: false,
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

const pulsing = ref(false)

/** Значение на экране: скрытый счётчик — то же самое, что его отсутствие. */
const visibleValue = computed(() => showCount.value ? props.value : undefined)

/**
 * Пока анимация играет, новое изменение её не перезапускает: счётчик меняется
 * пачкой (пять писем за секунду), и «поп» на каждое превратился бы в мельтешение.
 * Серия за время анимации даёт ровно один «поп».
 *
 * Флаг отпускает `animationend`, а не таймер: длительность живёт в CSS-токене,
 * и число в скрипте было бы вторым источником правды. Под
 * `prefers-reduced-motion` событие тоже приходит — глобальный кламп сжимает
 * анимацию до `0.01ms`, а не выключает её (`docs/motion.md`).
 */
watch(visibleValue, (next, prev) => {
  if (!props.animate || pulsing.value) return
  if (isBadgeWrapPulse(prev, next)) pulsing.value = true
})

// Ушедший с экрана счётчик `animationend` уже не пришлёт, и без сброса
// следующее его появление осталось бы без анимации навсегда.
watch(showCount, (visible) => {
  if (!visible) pulsing.value = false
})

defineSlots<{
  /** Элемент, к которому крепится метка. */
  default?: () => any
}>()

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
        :data-gr-badge-wrap-pop="pulsing || undefined"
        :class="[countBaseClass, placementClass[placement], toneClass[tone]]"
        aria-hidden="true"
        @animationend="pulsing = false"
      >{{ displayValue }}</span>
      <span data-gr-badge-wrap-label class="sr-only">{{ countLabel }}</span>
    </template>
  </span>
</template>

<style>
@keyframes gr-badge-wrap-pop {
  0% {
    transform: scale(0.4);
  }
  60% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}

/*
 * `animation-fill-mode` не задан намеренно: под `prefers-reduced-motion` анимация
 * доигрывает за `0.01ms` и возвращает элемент в исходный кадр — бейдж на месте
 * и в нужном размере. Именно поэтому компоненту хватает глобального клампа и не
 * нужен собственный reduce-блок (`docs/motion.md`).
 */
[data-gr-badge-wrap-count][data-gr-badge-wrap-pop] {
  animation: gr-badge-wrap-pop var(--gr-duration-base) var(--gr-ease-out);
}
</style>
