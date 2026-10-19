<script setup lang="ts">
import type { CSSProperties } from 'vue'

import { GR_TONES, type GrButtonVariant } from '@feugene/granularity'

const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border'] as const satisfies readonly GrButtonVariant[]
const buttonTones = GR_TONES
const buttonStates = [
  { key: 'rest', label: 'Rest' },
  { key: 'hover', label: 'Hover' },
  { key: 'focus', label: 'Focus' },
  { key: 'active', label: 'Active' },
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
  borderSoft: string
  border: string
  borderHover: string
  borderActive: string
}

const buttonToneTokens: Record<ButtonTone, ButtonToneTokens> = {
  primary: {
    solidBackground: 'var(--gr-button-primary-bg,var(--gr-primary))',
    solidBackgroundHover: 'var(--gr-button-primary-bg-hover,var(--gr-primary-hover))',
    solidBackgroundActive: 'var(--gr-button-primary-bg-active,var(--gr-primary-active))',
    solidForeground: 'var(--gr-button-primary-fg,var(--gr-primary-fg))',
    accentText: 'var(--gr-accent-fg)',
    softBackground: 'var(--gr-button-primary-soft-bg)',
    softBackgroundHover: 'var(--gr-button-primary-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-primary-soft-bg-active)',
    softForeground: 'var(--gr-accent-fg)',
    borderSoft: 'var(--gr-button-primary-border-soft)',
    border: 'var(--gr-button-primary-border)',
    borderHover: 'var(--gr-primary)',
    borderActive: 'var(--gr-primary-active)',
  },
  neutral: {
    solidBackground: 'var(--gr-secondary)',
    solidBackgroundHover: 'var(--gr-secondary-hover)',
    solidBackgroundActive: 'var(--gr-secondary-active)',
    solidForeground: 'var(--gr-secondary-fg)',
    accentText: 'var(--gr-fg)',
    softBackground: 'var(--gr-button-neutral-soft-bg)',
    softBackgroundHover: 'var(--gr-button-neutral-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-neutral-soft-bg-active)',
    softForeground: 'var(--gr-secondary-fg)',
    borderSoft: 'var(--gr-button-neutral-border)',
    border: 'var(--gr-button-neutral-border)',
    borderHover: 'var(--gr-brd-hover,var(--gr-brd))',
    borderActive: 'var(--gr-brd-active,var(--gr-brd))',
  },
  success: {
    solidBackground: 'var(--gr-button-success-bg,var(--gr-success))',
    solidBackgroundHover: 'var(--gr-button-success-bg-hover,var(--gr-success-hover))',
    solidBackgroundActive: 'var(--gr-button-success-bg-active,var(--gr-success-active))',
    solidForeground: 'var(--gr-button-success-fg,var(--gr-success-fg,var(--gr-fg)))',
    accentText: 'var(--gr-success-text,var(--gr-success))',
    softBackground: 'var(--gr-button-success-soft-bg)',
    softBackgroundHover: 'var(--gr-button-success-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-success-soft-bg-active)',
    softForeground: 'var(--gr-success-text,var(--gr-success))',
    borderSoft: 'var(--gr-button-success-border-soft)',
    border: 'var(--gr-button-success-border)',
    borderHover: 'var(--gr-success)',
    borderActive: 'var(--gr-success-active)',
  },
  warning: {
    solidBackground: 'var(--gr-button-warning-bg,var(--gr-warning))',
    solidBackgroundHover: 'var(--gr-button-warning-bg-hover,var(--gr-warning-hover))',
    solidBackgroundActive: 'var(--gr-button-warning-bg-active,var(--gr-warning-active))',
    solidForeground: 'var(--gr-button-warning-fg,var(--gr-warning-fg,var(--gr-fg)))',
    accentText: 'var(--gr-warning-text,var(--gr-warning))',
    softBackground: 'var(--gr-button-warning-soft-bg)',
    softBackgroundHover: 'var(--gr-button-warning-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-warning-soft-bg-active)',
    softForeground: 'var(--gr-warning-text,var(--gr-warning))',
    borderSoft: 'var(--gr-button-warning-border-soft)',
    border: 'var(--gr-button-warning-border)',
    borderHover: 'var(--gr-warning)',
    borderActive: 'var(--gr-warning-active)',
  },
  danger: {
    solidBackground: 'var(--gr-button-danger-bg,var(--gr-danger))',
    solidBackgroundHover: 'var(--gr-button-danger-bg-hover,var(--gr-danger-hover))',
    solidBackgroundActive: 'var(--gr-button-danger-bg-active,var(--gr-danger-active))',
    solidForeground: 'var(--gr-button-danger-fg,var(--gr-danger-fg,var(--gr-fg)))',
    accentText: 'var(--gr-danger-text,var(--gr-danger))',
    softBackground: 'var(--gr-button-danger-soft-bg)',
    softBackgroundHover: 'var(--gr-button-danger-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-danger-soft-bg-active)',
    softForeground: 'var(--gr-danger-text,var(--gr-danger))',
    borderSoft: 'var(--gr-button-danger-border-soft)',
    border: 'var(--gr-button-danger-border)',
    borderHover: 'var(--gr-danger)',
    borderActive: 'var(--gr-danger-active)',
  },
  info: {
    solidBackground: 'var(--gr-button-info-bg,var(--gr-info))',
    solidBackgroundHover: 'var(--gr-button-info-bg-hover,var(--gr-info-hover))',
    solidBackgroundActive: 'var(--gr-button-info-bg-active,var(--gr-info-active))',
    solidForeground: 'var(--gr-button-info-fg,var(--gr-info-fg,var(--gr-fg)))',
    accentText: 'var(--gr-info-text,var(--gr-info))',
    softBackground: 'var(--gr-button-info-soft-bg)',
    softBackgroundHover: 'var(--gr-button-info-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-info-soft-bg-active)',
    softForeground: 'var(--gr-info-text,var(--gr-info))',
    borderSoft: 'var(--gr-button-info-border-soft)',
    border: 'var(--gr-button-info-border)',
    borderHover: 'var(--gr-info)',
    borderActive: 'var(--gr-info-active)',
  },
  slate: {
    solidBackground: 'var(--gr-button-slate-bg,var(--gr-slate))',
    solidBackgroundHover: 'var(--gr-button-slate-bg-hover,var(--gr-slate-hover))',
    solidBackgroundActive: 'var(--gr-button-slate-bg-active,var(--gr-slate-active))',
    solidForeground: 'var(--gr-button-slate-fg,var(--gr-slate-fg,var(--gr-fg)))',
    accentText: 'var(--gr-slate-text,var(--gr-slate))',
    softBackground: 'var(--gr-button-slate-soft-bg)',
    softBackgroundHover: 'var(--gr-button-slate-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-slate-soft-bg-active)',
    softForeground: 'var(--gr-slate-text,var(--gr-slate))',
    borderSoft: 'var(--gr-button-slate-border-soft)',
    border: 'var(--gr-button-slate-border)',
    borderHover: 'var(--gr-slate)',
    borderActive: 'var(--gr-slate-active)',
  },
  azure: {
    solidBackground: 'var(--gr-button-azure-bg,var(--gr-azure))',
    solidBackgroundHover: 'var(--gr-button-azure-bg-hover,var(--gr-azure-hover))',
    solidBackgroundActive: 'var(--gr-button-azure-bg-active,var(--gr-azure-active))',
    solidForeground: 'var(--gr-button-azure-fg,var(--gr-azure-fg,var(--gr-fg)))',
    accentText: 'var(--gr-azure-text,var(--gr-azure))',
    softBackground: 'var(--gr-button-azure-soft-bg)',
    softBackgroundHover: 'var(--gr-button-azure-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-azure-soft-bg-active)',
    softForeground: 'var(--gr-azure-text,var(--gr-azure))',
    borderSoft: 'var(--gr-button-azure-border-soft)',
    border: 'var(--gr-button-azure-border)',
    borderHover: 'var(--gr-azure)',
    borderActive: 'var(--gr-azure-active)',
  },
}

function byState<T>(state: ButtonState, rest: T, hover: T, active: T): T {
  if (state === 'hover')
    return hover
  return state === 'active' ? active : rest
}

// Фокус и нажатие — как у самой кнопки: контур с отступом и вдавливание на 2%.
function forcedStyle(state: ButtonState): CSSProperties {
  if (state === 'focus')
    return { outline: '2px solid var(--gr-ring)', outlineOffset: '2px' }
  if (state === 'active')
    return { transform: 'scale(0.98)' }
  return {}
}

function getButtonPreviewStyle(variant: ButtonVariant, tone: ButtonTone, state: ButtonState): CSSProperties {
  const tokens = buttonToneTokens[tone]
  const softBackground = byState(state, 'transparent', tokens.softBackgroundHover, tokens.softBackgroundActive)

  if (variant === 'primary') {
    const background = byState(state, tokens.solidBackground, tokens.solidBackgroundHover, tokens.solidBackgroundActive)
    return {
      backgroundColor: background,
      borderColor: background,
      color: tokens.solidForeground,
      boxShadow: state === 'active' ? 'var(--gr-button-shadow-active)' : 'var(--gr-button-shadow)',
      ...forcedStyle(state),
    }
  }

  if (variant === 'secondary') {
    return {
      backgroundColor: byState(state, tokens.softBackground, tokens.softBackgroundHover, tokens.softBackgroundActive),
      borderColor: byState(state, tokens.borderSoft, tokens.border, tokens.borderHover),
      color: tokens.softForeground,
      ...forcedStyle(state),
    }
  }

  if (variant === 'outline') {
    return {
      backgroundColor: softBackground,
      borderColor: byState(state, tokens.border, tokens.borderHover, tokens.borderActive),
      color: tokens.accentText,
      ...forcedStyle(state),
    }
  }

  if (variant === 'ghost') {
    return {
      backgroundColor: softBackground,
      color: tokens.accentText,
      ...forcedStyle(state),
    }
  }

  return {
    backgroundColor: softBackground,
    borderColor: byState(state, 'transparent', tokens.border, tokens.borderActive),
    color: tokens.accentText,
    ...forcedStyle(state),
  }
}
</script>

<template>
  <div class="grid gap-4">
    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      The same matrix that lived in `playground-5`: for each `tone` you can see live buttons and force-rendered `hover`, `focus`, and `active` states across all `variant`s.
    </div>

    <div class="grid gap-4">
      <article
        v-for="tone in buttonTones"
        :key="tone"
        class="overflow-x-auto rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="showcase-demo-title text-sm font-semibold uppercase tracking-[0.12em]">
            tone: {{ tone }}
          </h3>
          <span class="showcase-demo-text text-xs">
            Live + 4 states × {{ buttonVariants.length }} variants
          </span>
        </div>

        <table class="min-w-full border-separate border-spacing-3">
          <thead>
            <tr>
              <th class="w-28 px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gr-muted-fg)]">
                state \ variant
              </th>
              <th
                v-for="variant in buttonVariants"
                :key="`${tone}-variant-${variant}`"
                class="px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gr-muted-fg)]"
              >
                {{ variant }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th class="px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gr-muted-fg)]">
                Live
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
              <th class="px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gr-muted-fg)]">
                {{ state.label }}
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
