<script setup lang="ts">
import { type CSSProperties } from 'vue'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import { GR_TONES, GrButton, type GrButtonVariant } from '@feugene/granularity'

const { t } = useFintI18n()

const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border'] as const satisfies readonly GrButtonVariant[]
const buttonTones = GR_TONES
const buttonStates = [
  {key: 'rest', labelKey: 'stateRest'},
  {key: 'hover', labelKey: 'stateHover'},
  {key: 'focus', labelKey: 'stateFocus'},
  {key: 'active', labelKey: 'stateActive'},
] as const

type ButtonVariant = (typeof buttonVariants)[number]
type ButtonTone = (typeof buttonTones)[number]
type ButtonState = (typeof buttonStates)[number]['key']

type ButtonToneTokens = {
  solidBackground: string
  solidBackgroundHover: string
  solidBackgroundActive: string
  solidForeground: string
  accentText: string
  softBackground: string
  softBackgroundHover: string
  softBackgroundActive: string
  softForeground: string
  border: string
  borderHover: string
  borderActive: string
}

const buttonToneTokens: Record<ButtonTone, ButtonToneTokens> = {
  primary: {
    solidBackground: 'var(--gr-button-primary-bg,var(--primary))',
    solidBackgroundHover: 'var(--gr-button-primary-bg-hover,var(--primary-hover))',
    solidBackgroundActive: 'var(--gr-button-primary-bg-active,var(--primary-active))',
    solidForeground: 'var(--gr-button-primary-fg,var(--primary-fg))',
    accentText: 'var(--accent-fg)',
    softBackground: 'var(--gr-button-primary-soft-bg)',
    softBackgroundHover: 'var(--gr-button-primary-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-primary-soft-bg-active)',
    softForeground: 'var(--accent-fg)',
    border: 'var(--primary)',
    borderHover: 'var(--primary-hover)',
    borderActive: 'var(--primary-active)',
  },
  neutral: {
    solidBackground: 'var(--secondary)',
    solidBackgroundHover: 'var(--secondary-hover)',
    solidBackgroundActive: 'var(--secondary-active)',
    solidForeground: 'var(--secondary-fg)',
    accentText: 'var(--fg)',
    softBackground: 'var(--secondary)',
    softBackgroundHover: 'var(--secondary-hover)',
    softBackgroundActive: 'var(--secondary-active)',
    softForeground: 'var(--secondary-fg)',
    border: 'var(--brd)',
    borderHover: 'var(--brd-hover,var(--brd))',
    borderActive: 'var(--brd-active,var(--brd))',
  },
  success: {
    solidBackground: 'var(--gr-button-success-bg,var(--gr-success))',
    solidBackgroundHover: 'var(--gr-button-success-bg-hover,var(--gr-success-hover))',
    solidBackgroundActive: 'var(--gr-button-success-bg-active,var(--gr-success-active))',
    solidForeground: 'var(--gr-button-success-fg,var(--gr-success-fg,var(--fg)))',
    accentText: 'var(--gr-success-text,var(--gr-success))',
    softBackground: 'var(--gr-button-success-soft-bg)',
    softBackgroundHover: 'var(--gr-button-success-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-success-soft-bg-active)',
    softForeground: 'var(--gr-success-text,var(--gr-success))',
    border: 'var(--gr-success)',
    borderHover: 'var(--gr-success-hover)',
    borderActive: 'var(--gr-success-active)',
  },
  warning: {
    solidBackground: 'var(--gr-button-warning-bg,var(--gr-warning))',
    solidBackgroundHover: 'var(--gr-button-warning-bg-hover,var(--gr-warning-hover))',
    solidBackgroundActive: 'var(--gr-button-warning-bg-active,var(--gr-warning-active))',
    solidForeground: 'var(--gr-button-warning-fg,var(--gr-warning-fg,var(--fg)))',
    accentText: 'var(--gr-warning-text,var(--gr-warning))',
    softBackground: 'var(--gr-button-warning-soft-bg)',
    softBackgroundHover: 'var(--gr-button-warning-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-warning-soft-bg-active)',
    softForeground: 'var(--gr-warning-text,var(--gr-warning))',
    border: 'var(--gr-warning)',
    borderHover: 'var(--gr-warning-hover)',
    borderActive: 'var(--gr-warning-active)',
  },
  danger: {
    solidBackground: 'var(--gr-button-danger-bg,var(--gr-danger))',
    solidBackgroundHover: 'var(--gr-button-danger-bg-hover,var(--gr-danger-hover))',
    solidBackgroundActive: 'var(--gr-button-danger-bg-active,var(--gr-danger-active))',
    solidForeground: 'var(--gr-button-danger-fg,var(--gr-danger-fg,var(--fg)))',
    accentText: 'var(--gr-danger-text,var(--gr-danger))',
    softBackground: 'var(--gr-button-danger-soft-bg)',
    softBackgroundHover: 'var(--gr-button-danger-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-danger-soft-bg-active)',
    softForeground: 'var(--gr-danger-text,var(--gr-danger))',
    border: 'var(--gr-danger)',
    borderHover: 'var(--gr-danger-hover)',
    borderActive: 'var(--gr-danger-active)',
  },
  info: {
    solidBackground: 'var(--gr-button-info-bg,var(--gr-info))',
    solidBackgroundHover: 'var(--gr-button-info-bg-hover,var(--gr-info-hover))',
    solidBackgroundActive: 'var(--gr-button-info-bg-active,var(--gr-info-active))',
    solidForeground: 'var(--gr-button-info-fg,var(--gr-info-fg,var(--fg)))',
    accentText: 'var(--gr-info-text,var(--gr-info))',
    softBackground: 'var(--gr-button-info-soft-bg)',
    softBackgroundHover: 'var(--gr-button-info-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-info-soft-bg-active)',
    softForeground: 'var(--gr-info-text,var(--gr-info))',
    border: 'var(--gr-info)',
    borderHover: 'var(--gr-info-hover)',
    borderActive: 'var(--gr-info-active)',
  },
  slate: {
    solidBackground: 'var(--gr-button-slate-bg,var(--gr-slate))',
    solidBackgroundHover: 'var(--gr-button-slate-bg-hover,var(--gr-slate-hover))',
    solidBackgroundActive: 'var(--gr-button-slate-bg-active,var(--gr-slate-active))',
    solidForeground: 'var(--gr-button-slate-fg,var(--gr-slate-fg,var(--fg)))',
    accentText: 'var(--gr-slate-text,var(--gr-slate))',
    softBackground: 'var(--gr-button-slate-soft-bg)',
    softBackgroundHover: 'var(--gr-button-slate-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-slate-soft-bg-active)',
    softForeground: 'var(--gr-slate-text,var(--gr-slate))',
    border: 'var(--gr-slate)',
    borderHover: 'var(--gr-slate-hover)',
    borderActive: 'var(--gr-slate-active)',
  },
  azure: {
    solidBackground: 'var(--gr-button-azure-bg,var(--gr-azure))',
    solidBackgroundHover: 'var(--gr-button-azure-bg-hover,var(--gr-azure-hover))',
    solidBackgroundActive: 'var(--gr-button-azure-bg-active,var(--gr-azure-active))',
    solidForeground: 'var(--gr-button-azure-fg,var(--gr-azure-fg,var(--fg)))',
    accentText: 'var(--gr-azure-text,var(--gr-azure))',
    softBackground: 'var(--gr-button-azure-soft-bg)',
    softBackgroundHover: 'var(--gr-button-azure-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-azure-soft-bg-active)',
    softForeground: 'var(--gr-azure-text,var(--gr-azure))',
    border: 'var(--gr-azure)',
    borderHover: 'var(--gr-azure-hover)',
    borderActive: 'var(--gr-azure-active)',
  },
}

function getButtonPreviewStyle(variant: ButtonVariant, tone: ButtonTone, state: ButtonState): CSSProperties {
  const tokens = buttonToneTokens[tone]
  const isFocus = state === 'focus'

  if (variant === 'primary') {
    return {
      backgroundColor: state === 'hover'
        ? tokens.solidBackgroundHover
        : state === 'active'
          ? tokens.solidBackgroundActive
          : tokens.solidBackground,
      borderColor: state === 'hover'
        ? tokens.solidBackgroundHover
        : state === 'active'
          ? tokens.solidBackgroundActive
          : tokens.solidBackground,
      color: tokens.solidForeground,
      boxShadow: isFocus ? '0 0 0 2px var(--ring)' : undefined,
    }
  }

  if (variant === 'secondary') {
    return {
      backgroundColor: state === 'hover'
        ? tokens.softBackgroundHover
        : state === 'active'
          ? tokens.softBackgroundActive
          : tokens.softBackground,
      borderColor: state === 'hover'
        ? tokens.borderHover
        : state === 'active'
          ? tokens.borderActive
          : tokens.border,
      color: tokens.softForeground,
      boxShadow: isFocus ? '0 0 0 2px var(--ring)' : undefined,
    }
  }

  if (variant === 'outline') {
    return {
      backgroundColor: state === 'hover'
        ? tokens.softBackgroundHover
        : state === 'active'
          ? tokens.softBackgroundActive
          : 'transparent',
      borderColor: state === 'hover'
        ? tokens.borderHover
        : state === 'active'
          ? tokens.borderActive
          : tokens.border,
      color: tokens.accentText,
      boxShadow: isFocus ? '0 0 0 2px var(--ring)' : undefined,
    }
  }

  if (variant === 'ghost') {
    return {
      backgroundColor: state === 'hover'
        ? tokens.softBackgroundHover
        : state === 'active'
          ? tokens.softBackgroundActive
          : 'transparent',
      color: tokens.accentText,
      boxShadow: isFocus ? '0 0 0 2px var(--ring)' : undefined,
    }
  }

  return {
    backgroundColor: state === 'hover'
      ? tokens.softBackgroundHover
      : state === 'active'
        ? tokens.softBackgroundActive
        : 'transparent',
    borderColor: state === 'hover'
      ? tokens.borderHover
      : state === 'active'
        ? tokens.borderActive
        : 'transparent',
    color: tokens.accentText,
    boxShadow: isFocus ? '0 0 0 2px var(--ring)' : undefined,
  }
}
</script>

<template>
  <div class="grid gap-4">
    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      {{ t('components.GrButton.matrix.description') }}
    </div>

    <div class="grid gap-4">
      <article
        v-for="tone in buttonTones"
        :key="tone"
        class="overflow-x-auto rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="showcase-demo-title text-sm font-semibold uppercase tracking-[0.12em]">
            tone: {{ tone }}
          </h3>
          <span class="showcase-demo-text text-xs">
            {{ t('components.GrButton.matrix.liveCount', { count: buttonVariants.length }) }}
          </span>
        </div>

        <table class="min-w-full border-separate border-spacing-3">
          <thead>
            <tr>
              <th class="w-28 px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-fg)]">
                {{ t('components.GrButton.matrix.stateVsVariant') }}
              </th>
              <th
                v-for="variant in buttonVariants"
                :key="`${tone}-variant-${variant}`"
                class="px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-fg)]"
              >
                {{ variant }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th class="px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-fg)]">
                {{ t('components.GrButton.matrix.live') }}
              </th>
              <td
                v-for="variant in buttonVariants"
                :key="`${tone}-live-${variant}`"
                class="px-2 py-1 align-middle"
              >
                <GrButton
                  :variant="variant"
                  :tone="tone"
                  class="w-full justify-center"
                >
                  {{ variant }}
                </GrButton>
              </td>
            </tr>

            <tr v-for="state in buttonStates" :key="`${tone}-${state.key}`">
              <th class="px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-fg)]">
                {{ t(`components.GrButton.matrix.${state.labelKey}`) }}
              </th>
              <td
                v-for="variant in buttonVariants"
                :key="`${tone}-${state.key}-${variant}`"
                class="px-2 py-1 align-middle"
              >
                <GrButton
                  :variant="variant"
                  :tone="tone"
                  class="w-full justify-center"
                  :style="getButtonPreviewStyle(variant, tone, state.key)"
                >
                  {{ variant }}
                </GrButton>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  </div>
</template>