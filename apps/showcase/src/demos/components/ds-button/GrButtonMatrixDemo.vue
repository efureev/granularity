<script setup lang="ts">
import { type CSSProperties } from 'vue'

import { GrButton, type GrButtonTone, type GrButtonVariant } from '@feugene/granularity'

const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border'] as const satisfies readonly GrButtonVariant[]
const buttonTones = ['primary', 'neutral', 'success', 'warning', 'danger', 'info', 'slate', 'azure'] as const satisfies readonly GrButtonTone[]
const buttonStates = [
  {key: 'rest', label: 'Обычное'},
  {key: 'hover', label: 'Hover'},
  {key: 'focus', label: 'Focus'},
  {key: 'active', label: 'Active'},
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
    solidBackground: 'var(--ds-button-primary-bg,var(--primary))',
    solidBackgroundHover: 'var(--ds-button-primary-bg-hover,var(--primary-hover))',
    solidBackgroundActive: 'var(--ds-button-primary-bg-active,var(--primary-active))',
    solidForeground: 'var(--ds-button-primary-fg,var(--primary-fg))',
    accentText: 'var(--accent-fg)',
    softBackground: 'var(--ds-button-primary-soft-bg)',
    softBackgroundHover: 'var(--ds-button-primary-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-primary-soft-bg-active)',
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
    solidBackground: 'var(--ds-button-success-bg,var(--ds-success))',
    solidBackgroundHover: 'var(--ds-button-success-bg-hover,var(--ds-success-hover))',
    solidBackgroundActive: 'var(--ds-button-success-bg-active,var(--ds-success-active))',
    solidForeground: 'var(--ds-button-success-fg,var(--ds-success-fg,var(--fg)))',
    accentText: 'var(--ds-success-text,var(--ds-success))',
    softBackground: 'var(--ds-button-success-soft-bg)',
    softBackgroundHover: 'var(--ds-button-success-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-success-soft-bg-active)',
    softForeground: 'var(--ds-success-text,var(--ds-success))',
    border: 'var(--ds-success)',
    borderHover: 'var(--ds-success-hover)',
    borderActive: 'var(--ds-success-active)',
  },
  warning: {
    solidBackground: 'var(--ds-button-warning-bg,var(--ds-warning))',
    solidBackgroundHover: 'var(--ds-button-warning-bg-hover,var(--ds-warning-hover))',
    solidBackgroundActive: 'var(--ds-button-warning-bg-active,var(--ds-warning-active))',
    solidForeground: 'var(--ds-button-warning-fg,var(--ds-warning-fg,var(--fg)))',
    accentText: 'var(--ds-warning-text,var(--ds-warning))',
    softBackground: 'var(--ds-button-warning-soft-bg)',
    softBackgroundHover: 'var(--ds-button-warning-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-warning-soft-bg-active)',
    softForeground: 'var(--ds-warning-text,var(--ds-warning))',
    border: 'var(--ds-warning)',
    borderHover: 'var(--ds-warning-hover)',
    borderActive: 'var(--ds-warning-active)',
  },
  danger: {
    solidBackground: 'var(--ds-button-danger-bg,var(--ds-danger))',
    solidBackgroundHover: 'var(--ds-button-danger-bg-hover,var(--ds-danger-hover))',
    solidBackgroundActive: 'var(--ds-button-danger-bg-active,var(--ds-danger-active))',
    solidForeground: 'var(--ds-button-danger-fg,var(--ds-danger-fg,var(--fg)))',
    accentText: 'var(--ds-danger-text,var(--ds-danger))',
    softBackground: 'var(--ds-button-danger-soft-bg)',
    softBackgroundHover: 'var(--ds-button-danger-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-danger-soft-bg-active)',
    softForeground: 'var(--ds-danger-text,var(--ds-danger))',
    border: 'var(--ds-danger)',
    borderHover: 'var(--ds-danger-hover)',
    borderActive: 'var(--ds-danger-active)',
  },
  info: {
    solidBackground: 'var(--ds-button-info-bg,var(--ds-info))',
    solidBackgroundHover: 'var(--ds-button-info-bg-hover,var(--ds-info-hover))',
    solidBackgroundActive: 'var(--ds-button-info-bg-active,var(--ds-info-active))',
    solidForeground: 'var(--ds-button-info-fg,var(--ds-info-fg,var(--fg)))',
    accentText: 'var(--ds-info-text,var(--ds-info))',
    softBackground: 'var(--ds-button-info-soft-bg)',
    softBackgroundHover: 'var(--ds-button-info-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-info-soft-bg-active)',
    softForeground: 'var(--ds-info-text,var(--ds-info))',
    border: 'var(--ds-info)',
    borderHover: 'var(--ds-info-hover)',
    borderActive: 'var(--ds-info-active)',
  },
  slate: {
    solidBackground: 'var(--ds-button-slate-bg,var(--ds-slate))',
    solidBackgroundHover: 'var(--ds-button-slate-bg-hover,var(--ds-slate-hover))',
    solidBackgroundActive: 'var(--ds-button-slate-bg-active,var(--ds-slate-active))',
    solidForeground: 'var(--ds-button-slate-fg,var(--ds-slate-fg,var(--fg)))',
    accentText: 'var(--ds-slate-text,var(--ds-slate))',
    softBackground: 'var(--ds-button-slate-soft-bg)',
    softBackgroundHover: 'var(--ds-button-slate-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-slate-soft-bg-active)',
    softForeground: 'var(--ds-slate-text,var(--ds-slate))',
    border: 'var(--ds-slate)',
    borderHover: 'var(--ds-slate-hover)',
    borderActive: 'var(--ds-slate-active)',
  },
  azure: {
    solidBackground: 'var(--ds-button-azure-bg,var(--ds-azure))',
    solidBackgroundHover: 'var(--ds-button-azure-bg-hover,var(--ds-azure-hover))',
    solidBackgroundActive: 'var(--ds-button-azure-bg-active,var(--ds-azure-active))',
    solidForeground: 'var(--ds-button-azure-fg,var(--ds-azure-fg,var(--fg)))',
    accentText: 'var(--ds-azure-text,var(--ds-azure))',
    softBackground: 'var(--ds-button-azure-soft-bg)',
    softBackgroundHover: 'var(--ds-button-azure-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-azure-soft-bg-active)',
    softForeground: 'var(--ds-azure-text,var(--ds-azure))',
    border: 'var(--ds-azure)',
    borderHover: 'var(--ds-azure-hover)',
    borderActive: 'var(--ds-azure-active)',
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
      Та же матрица, что была в `playground-5`: для каждого `tone` видно live-кнопки и принудительно
      отрисованные состояния `hover`, `focus`, `active` по всем `variant`.
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
            Live + 4 состояния × {{ buttonVariants.length }} вариантов
          </span>
        </div>

        <table class="min-w-full border-separate border-spacing-3">
          <thead>
            <tr>
              <th class="w-28 px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-fg)]">
                state \ variant
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
              <th class="px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-fg)]">
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