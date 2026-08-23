<script setup lang="ts">
/**
 * GrAlert — блочное сообщение с тоном, иконкой и опциональным закрытием.
 *
 * Цветовая модель вынесена в `grAlertStyles.ts` и выражена **только токенами**
 * `--gr-*`: компонент одинаково корректен в light и dark без единого hex-литерала.
 *
 * Точки кастомизации — переменные `--gr-alert-*` (см. `grAlertCssVars`); пропы
 * `backgroundColor`/`textColor`/`borderColor` — тот же контракт, но точечно.
 */
import { computed } from 'vue'

import IconWarning from '~icons/lucide/alert-triangle'
import IconCheck from '~icons/lucide/check-circle'
import IconInfo from '~icons/lucide/info'
import IconClose from '~icons/lucide/x'
import IconError from '~icons/lucide/x-circle'

import type { Component } from 'vue'
import type { GrTone } from '../shared/tones'
import type { GrAlertIconKey, GrAlertVariant } from './grAlertStyles'

import { useGrComponentProp } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import {
  applyGrAlertOverrides,
  grAlertCssVars,
  grAlertIconKey,
  resolveGrAlertColors,
} from './grAlertStyles'

import './defaults'

export type GrAlertTone = GrTone
export type { GrAlertVariant } from './grAlertStyles'

/**
 * Режим объявления сообщения скринридеру.
 * `auto` — по тону: `warning`/`danger` перебивают речь (`role="alert"`),
 * остальные ждут паузы (`role="status"`).
 */
export type GrAlertLive = 'auto' | 'assertive' | 'polite' | 'off'

export interface GrAlertProps {
  tone?: GrAlertTone
  variant?: GrAlertVariant
  title?: string
  closable?: boolean
  live?: GrAlertLive
  /**
   * Показывать ли иконку тона. Своя иконка — слотом `#icon`; проп нужен для
   * случая «иконка мешает»: узкая колонка, плотный список, сообщение в форме.
   */
  icon?: boolean
  /**
   * Видимость сообщения — **только контролируемая**: без пропа алерт виден
   * всегда, и закрытие остаётся заботой потребителя (`@close`). С
   * `v-model:visible` компонент прячет себя сам.
   *
   * Собственного состояния у пропа нет намеренно. Оно превратило бы кнопку
   * закрытия в необратимое действие у всех, кто уже живёт на `@close` и,
   * например, спрашивает по нему подтверждение.
   */
  visible?: boolean
  backgroundColor?: string
  textColor?: string
  borderColor?: string
}

export interface GrAlertEmits {
  (e: 'close'): void
  /** Пользователь закрыл сообщение (`v-model:visible`). */
  (e: 'update:visible', value: boolean): void
}

const emit = defineEmits<GrAlertEmits>()

defineSlots<{
  /** Текст сообщения. */
  default?: () => any
  /** Иконка вместо глифа по тону. Декоративна: остаётся `aria-hidden`. */
  icon?: () => any
  /** Действия по сообщению: «Повторить», «Подробнее». Ложатся под текст. */
  actions?: () => any
}>()

// Дефолты tone/variant/closable/live намеренно `undefined`: «настоящий» дефолт
// переехал в `useGrComponentProp`, иначе `GrConfigProvider` не смог бы отличить
// заданный пользователем проп от подставленного Vue.
const props = withDefaults(defineProps<GrAlertProps>(), {
  tone: undefined,
  variant: undefined,
  title: undefined,
  closable: undefined,
  live: undefined,
  icon: undefined,
  visible: undefined,
  backgroundColor: undefined,
  textColor: undefined,
  borderColor: undefined,
})

const { t } = useGranularityTranslations()

const tone = useGrComponentProp('GrAlert', 'tone', () => props.tone, 'info')
const variantInput = useGrComponentProp('GrAlert', 'variant', () => props.variant, 'soft')
const closable = useGrComponentProp('GrAlert', 'closable', () => props.closable, false)
const live = useGrComponentProp('GrAlert', 'live', () => props.live, 'auto')

const variant = variantInput

const ICONS: Record<GrAlertIconKey, Component> = {
  info: IconInfo,
  success: IconCheck,
  warning: IconWarning,
  danger: IconError,
}

const toneIcon = computed<Component>(() => ICONS[grAlertIconKey(tone.value)])

const showIcon = computed(() => props.icon !== false)
const isVisible = computed(() => props.visible !== false)

function close(): void {
  emit('update:visible', false)
  emit('close')
}

const colors = computed(() => applyGrAlertOverrides(
  resolveGrAlertColors(tone.value, variant.value),
  props,
))

const rootStyle = computed(() => ({
  ...grAlertCssVars(colors.value),
  background: 'var(--gr-alert-bg)',
  borderColor: 'var(--gr-alert-brd)',
}))

/**
 * `role="alert"` — assertive-регион: он прерывает чтение. Вешать его на любое
 * информационное сообщение значит превращать спокойную подсказку в тревогу,
 * поэтому по умолчанию его получают только `warning` и `danger`.
 */
const role = computed(() => {
  const mode = live.value === 'auto'
    ? (tone.value === 'danger' || tone.value === 'warning' ? 'assertive' : 'polite')
    : live.value

  if (mode === 'off')
    return undefined
  return mode === 'assertive' ? 'alert' : 'status'
})
</script>

<template>
  <div
    v-if="isVisible"
    :role="role"
    data-gr-alert
    class="rounded-[var(--gr-radius-lg)] border px-4 py-3"
    :style="rootStyle"
  >
    <div class="flex items-start gap-3">
      <span
        v-if="showIcon"
        data-gr-alert-icon
        class="mt-0.5 h-5 w-5 shrink-0 text-[var(--gr-alert-icon-color)]"
        aria-hidden="true"
      >
        <slot name="icon">
          <component :is="toneIcon" class="h-5 w-5" />
        </slot>
      </span>

      <div class="min-w-0 flex-1">
        <div
          v-if="props.title"
          class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600 text-[var(--gr-alert-title-color)]"
        >
          {{ props.title }}
        </div>
        <div
          class="text-[length:var(--gr-text-sm)] leading-relaxed text-[var(--gr-alert-text-color)]"
          :class="props.title ? 'mt-1' : ''"
        >
          <slot />
        </div>

        <!-- Действия идут под текстом, а не рядом с ним: на узкой колонке
             кнопки в одной строке с сообщением отжимают его до одного слова. -->
        <div
          v-if="$slots.actions"
          data-gr-alert-actions
          class="mt-2 flex flex-wrap gap-2"
        >
          <slot name="actions" />
        </div>
      </div>

      <button
        v-if="closable"
        type="button"
        class="-mr-1.5 -mt-1.5 shrink-0 rounded-[var(--gr-radius-md)] p-1.5 text-[var(--gr-alert-close-color)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] hover:bg-[var(--gr-alert-close-hover-bg)] hover:text-[var(--gr-alert-close-hover-color)]"
        :aria-label="t('gr.common.close', 'Close')"
        @click="close"
      >
        <IconClose class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
