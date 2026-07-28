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
import type { GrAlertIconKey, GrAlertVariantInput } from './grAlertStyles'

import { useGrComponentProp } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import {
  applyGrAlertOverrides,
  grAlertCssVars,
  grAlertIconKey,
  normalizeGrAlertVariant,
  resolveGrAlertColors,
} from './grAlertStyles'

import './defaults'

export type GrAlertTone = GrTone
export type { GrAlertVariant, GrAlertVariantInput } from './grAlertStyles'

/**
 * Режим объявления сообщения скринридеру.
 * `auto` — по тону: `warning`/`danger` перебивают речь (`role="alert"`),
 * остальные ждут паузы (`role="status"`).
 */
export type GrAlertLive = 'auto' | 'assertive' | 'polite' | 'off'

export interface GrAlertProps {
  tone?: GrAlertTone
  variant?: GrAlertVariantInput
  title?: string
  closable?: boolean
  live?: GrAlertLive
  backgroundColor?: string
  textColor?: string
  borderColor?: string
}

const emit = defineEmits<{
  (event: 'close'): void
}>()

// Дефолты tone/variant/closable намеренно `undefined`: «настоящий» дефолт
// переехал в `useGrComponentProp`, иначе `GrConfigProvider` не смог бы отличить
// заданный пользователем проп от подставленного Vue.
const props = withDefaults(defineProps<GrAlertProps>(), {
  tone: undefined,
  variant: undefined,
  title: undefined,
  closable: undefined,
  live: 'auto',
  backgroundColor: undefined,
  textColor: undefined,
  borderColor: undefined,
})

const { t } = useGranularityTranslations()

const tone = useGrComponentProp('GrAlert', 'tone', () => props.tone, 'info')
const variantInput = useGrComponentProp('GrAlert', 'variant', () => props.variant, 'soft')
const closable = useGrComponentProp('GrAlert', 'closable', () => props.closable, false)

const variant = computed(() => normalizeGrAlertVariant(variantInput.value))

const ICONS: Record<GrAlertIconKey, Component> = {
  info: IconInfo,
  success: IconCheck,
  warning: IconWarning,
  danger: IconError,
}

const icon = computed<Component>(() => ICONS[grAlertIconKey(tone.value)])

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
  const mode = props.live === 'auto'
    ? (tone.value === 'danger' || tone.value === 'warning' ? 'assertive' : 'polite')
    : props.live

  if (mode === 'off') return undefined
  return mode === 'assertive' ? 'alert' : 'status'
})
</script>

<template>
  <div
    :role="role"
    data-gr-alert
    class="rounded-[var(--gr-radius-lg)] border px-4 py-3"
    :style="rootStyle"
  >
    <div class="flex items-start gap-3">
      <component
        :is="icon"
        class="mt-0.5 h-5 w-5 shrink-0 text-[var(--gr-alert-icon-color)]"
        aria-hidden="true"
      />

      <div class="min-w-0 flex-1">
        <div
          v-if="props.title"
          class="text-[length:var(--gr-text-sm)] font-600 text-[var(--gr-alert-title-color)]"
        >
          {{ props.title }}
        </div>
        <div
          class="text-[length:var(--gr-text-sm)] leading-relaxed text-[var(--gr-alert-text-color)]"
          :class="props.title ? 'mt-1' : ''"
        >
          <slot />
        </div>
      </div>

      <button
        v-if="closable"
        type="button"
        class="-mr-1.5 -mt-1.5 shrink-0 rounded-[var(--gr-radius-md)] p-1.5 text-[var(--gr-alert-close-color)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] hover:bg-[var(--gr-alert-close-hover-bg)] hover:text-[var(--gr-alert-close-hover-color)]"
        :aria-label="t('gr.common.close', 'Close')"
        @click="emit('close')"
      >
        <IconClose class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
