<script setup lang="ts">
import { computed } from 'vue'

import IconWarning from '~icons/lucide/alert-triangle'
import IconCheck from '~icons/lucide/check-circle'
import IconInfo from '~icons/lucide/info'
import IconClose from '~icons/lucide/x'
import IconError from '~icons/lucide/x-circle'

import type { GrTone } from '../shared/tones'
import { useGranularityTranslations } from '../../internal/granularityI18n'

export type GrAlertTone = GrTone
export type GrAlertVariant = 'soft' | 'light'

type GrAlertResolvedStyles = {
  bg: string
  border: string
  icon: string
  title: string
  text: string
  close: string
  closeHover: string
  Icon: unknown
}

const DEFAULT_TEXT_COLORS = {
  title: 'var(--fg)',
  text: 'var(--muted-fg)',
  close: 'var(--muted-fg)',
  closeHover: 'var(--fg)',
} as const

const WARNING_LIGHT_TEXT_COLOR = '#92400e'

const emit = defineEmits<{
  (event: 'close'): void
}>()

const props = withDefaults(defineProps<{
  tone?: GrAlertTone
  variant?: GrAlertVariant
  title?: string
  closable?: boolean
  backgroundColor?: string
  textColor?: string
  borderColor?: string
}>(), {
  tone: 'info',
  variant: 'soft',
  title: undefined,
  closable: false,
  backgroundColor: undefined,
  textColor: undefined,
  borderColor: undefined,
})

const { t } = useGranularityTranslations()

const getCustomColor = (value?: string) => value?.trim() || undefined

const SOFT_TONE_STYLES: Record<GrAlertTone, GrAlertResolvedStyles> = {
  primary: {
    bg: 'var(--accent)',
    border: 'color-mix(in srgb, var(--primary) 22%, var(--brd))',
    icon: 'var(--primary)',
    ...DEFAULT_TEXT_COLORS,
    Icon: IconInfo,
  },
  neutral: {
    bg: 'var(--muted)',
    border: 'var(--brd)',
    icon: 'var(--muted-fg)',
    ...DEFAULT_TEXT_COLORS,
    Icon: IconInfo,
  },
  info: {
    bg: 'var(--gr-info-light)',
    border: 'color-mix(in srgb, var(--gr-info) 22%, var(--brd))',
    icon: 'var(--gr-info)',
    ...DEFAULT_TEXT_COLORS,
    Icon: IconInfo,
  },
  success: {
    bg: 'var(--gr-success-light)',
    border: 'color-mix(in srgb, var(--gr-success) 22%, var(--brd))',
    icon: 'var(--gr-success)',
    ...DEFAULT_TEXT_COLORS,
    Icon: IconCheck,
  },
  warning: {
    bg: 'var(--gr-warning-light)',
    border: 'color-mix(in srgb, var(--gr-warning) 22%, var(--brd))',
    icon: 'var(--gr-warning)',
    ...DEFAULT_TEXT_COLORS,
    Icon: IconWarning,
  },
  danger: {
    bg: 'var(--gr-danger-light)',
    border: 'color-mix(in srgb, var(--gr-danger) 22%, var(--brd))',
    icon: 'var(--gr-danger)',
    ...DEFAULT_TEXT_COLORS,
    Icon: IconError,
  },
  slate: {
    bg: 'var(--gr-slate-light)',
    border: 'color-mix(in srgb, var(--gr-slate) 22%, var(--brd))',
    icon: 'var(--gr-slate)',
    ...DEFAULT_TEXT_COLORS,
    Icon: IconInfo,
  },
  azure: {
    bg: 'var(--gr-azure-light)',
    border: 'color-mix(in srgb, var(--gr-azure) 22%, var(--brd))',
    icon: 'var(--gr-azure)',
    ...DEFAULT_TEXT_COLORS,
    Icon: IconInfo,
  },
}

const LIGHT_TONE_STYLES: Partial<Record<GrAlertTone, GrAlertResolvedStyles>> = {
  warning: {
    bg: '#fffbeb',
    border: '#fcd34d',
    icon: WARNING_LIGHT_TEXT_COLOR,
    title: WARNING_LIGHT_TEXT_COLOR,
    text: WARNING_LIGHT_TEXT_COLOR,
    close: WARNING_LIGHT_TEXT_COLOR,
    closeHover: WARNING_LIGHT_TEXT_COLOR,
    Icon: IconWarning,
  },
}

const styles = computed<GrAlertResolvedStyles>(() => {
  const base = (props.variant === 'light' ? LIGHT_TONE_STYLES[props.tone] : undefined) ?? SOFT_TONE_STYLES[props.tone]
  const customTextColor = getCustomColor(props.textColor)

  return {
    ...base,
    bg: getCustomColor(props.backgroundColor) ?? base.bg,
    border: getCustomColor(props.borderColor) ?? base.border,
    icon: customTextColor ?? base.icon,
    title: customTextColor ?? base.title,
    text: customTextColor ?? base.text,
    close: customTextColor ?? base.close,
    closeHover: customTextColor ?? base.closeHover,
  }
})

const rootStyle = computed(() => ({
  '--gr-alert-bg': styles.value.bg,
  '--gr-alert-brd': styles.value.border,
  '--gr-alert-icon-color': styles.value.icon,
  '--gr-alert-title-color': styles.value.title,
  '--gr-alert-text-color': styles.value.text,
  '--gr-alert-close-color': styles.value.close,
  '--gr-alert-close-hover-color': styles.value.closeHover,
  background: 'var(--gr-alert-bg)',
  borderColor: 'var(--gr-alert-brd)',
}))
</script>

<template>
  <div
    role="alert"
    class="rounded-[var(--gr-radius-lg)] border px-4 py-3"
    :style="rootStyle"
  >
    <div class="flex items-start gap-3">
      <component :is="styles.Icon" class="mt-0.5 h-5 w-5 text-[var(--gr-alert-icon-color)]" aria-hidden="true" />
      <div class="min-w-0 flex-1">
        <div v-if="props.title" class="text-[14px] font-700 text-[var(--gr-alert-title-color)]">
          {{ props.title }}
        </div>
        <div class="mt-0.5 text-[13px] text-[var(--gr-alert-text-color)]">
          <slot />
        </div>
      </div>

      <button
        v-if="props.closable"
        type="button"
        class="-mr-1 -mt-1 rounded-[var(--gr-radius-md)] p-1 text-[var(--gr-alert-close-color)] transition-colors hover:text-[var(--gr-alert-close-hover-color)]"
        :aria-label="t('gr.common.close', 'Close')"
        @click="emit('close')"
      >
        <IconClose class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>