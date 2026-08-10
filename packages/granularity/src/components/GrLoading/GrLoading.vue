<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type Component } from 'vue'

import IconLoader from '~icons/lucide/loader-circle'

import GrIcon from '../GrIcon/GrIcon.vue'
import type { GrIconSize, GrIconTone } from '../GrIcon/grIconStyles'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { grLoadingRootClass } from './grLoadingStyles'

/**
 * Пропы {@link GrLoading}.
 *
 * Оверлей загрузки: спиннер с подписью поверх соседнего контента. `fullscreen`
 * накрывает весь экран, иначе оверлей ложится на ближайшего позиционированного
 * предка.
 */
export interface GrLoadingProps {
  /** Подпись под спиннером. Пустая строка убирает её совсем. По умолчанию — из локали. */
  text?: string
  /** Свой компонент спиннера вместо иконки по умолчанию. */
  spinner?: Component
  /** Дополнительные классы обёртки спиннера. */
  spinnerClass?: string
  /** Размер спиннера: шкала пакета либо произвольный в пикселях. */
  spinnerSize?: GrIconSize | number
  /** Тон спиннера из палитры. */
  spinnerTone?: GrIconTone
  /** Вращение спиннера. По умолчанию включено. */
  animated?: boolean
  /** Свой `background-color`. Задан — дефолтный скрим `--gr-overlay-bg` снимается. */
  background?: string
  /** Накрыть весь экран (`position: fixed`) вместо ближайшего позиционированного предка. */
  fullscreen?: boolean
  /** Имя CSS-переменной слоя — escape-hatch мимо `--gr-z-loading`. */
  zIndexVar?: string
  /** Задержка показа в миллисекундах: короткая загрузка не мигает оверлеем. */
  delay?: number
  /** Дополнительные классы корня оверлея. */
  customClass?: string
}

export interface GrLoadingEmits {
  /**
   * Оверлей появился на экране — сразу или по истечении `delay`. По этому
   * событию директива блокирует контент под оверлеем: до показа блокировать
   * нечего, иначе быстрый запрос молча «замораживал» бы форму.
   */
  (e: 'show'): void
}

const props = withDefaults(
  defineProps<GrLoadingProps>(),
  {
    text: undefined,
    spinner: undefined,
    spinnerClass: undefined,
    // 28px не входит в шкалу иконок (14–20): спиннер загрузки — самостоятельный
    // акцент панели, а не иконка рядом с текстом.
    spinnerSize: 28,
    spinnerTone: 'neutral',
    animated: true,
    background: undefined,
    fullscreen: false,
    zIndexVar: undefined,
    delay: 0,
    customClass: undefined,
  },
)

const emit = defineEmits<GrLoadingEmits>()

defineSlots<{
  /** Содержимое панели целиком вместо спиннера с подписью. */
  default?: () => any
}>()

const { t } = useGranularityTranslations()

const Spinner = computed(() => props.spinner ?? IconLoader)

const displayText = computed(() => props.text ?? t('gr.loading.defaultText', 'Loading...'))

const rootClass = computed(() => {
  return grLoadingRootClass({
    fullscreen: props.fullscreen,
    hasBackground: props.background !== undefined,
    customClass: props.customClass,
  })
})

const rootStyle = computed(() => {
  return {
    backgroundColor: props.background,
    zIndex: props.zIndexVar ? `var(${props.zIndexVar})` : undefined,
  } as Record<string, string | undefined>
})

// Оверлей на быстром запросе успевает мигнуть и раздражает сильнее, чем его
// отсутствие. Отсчёт начинается с монтирования: компонент создаётся ровно в
// момент старта загрузки — и в `v-if`, и в директиве.
const visible = ref(props.delay <= 0)
let delayTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  if (visible.value) {
    emit('show')
    return
  }

  delayTimer = setTimeout(() => {
    visible.value = true
    emit('show')
  }, props.delay)
})

onBeforeUnmount(() => {
  clearTimeout(delayTimer)
})
</script>

<template>
  <div
    v-if="visible"
    data-gr-loading
    class="flex items-center justify-center cursor-wait select-none pointer-events-auto"
    :class="rootClass"
    :style="rootStyle"
    role="status"
    aria-live="polite"
  >
    <div
      data-gr-loading-panel
      class="flex flex-col items-center justify-center gap-2 text-center rounded-[var(--gr-radius-md)] bg-[var(--gr-bg)]/55 px-5 py-4 shadow-lg"
    >
      <slot>
        <GrIcon
          data-gr-loading-spinner
          :size="spinnerSize"
          :tone="spinnerTone"
          :spin="animated"
          :class="spinnerClass"
        >
          <component :is="Spinner" />
        </GrIcon>
        <div v-if="displayText" data-gr-loading-text class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ displayText }}
        </div>
      </slot>
    </div>
  </div>
</template>
