<script setup lang="ts">
import { computed, markRaw, type Component } from 'vue'

import IconLoader from '~icons/lucide/loader-circle'

export type { GrButtonSize, GrButtonTone, GrButtonVariant } from './grButtonStyles'

import {
  grButtonBaseClass,
  grButtonClass,
  type GrButtonSize,
  type GrButtonTone,
  type GrButtonVariant,
} from './grButtonStyles'

const props = withDefaults(
  defineProps<{
    variant?: GrButtonVariant
    tone?: GrButtonTone
    size?: GrButtonSize
    loading?: boolean
    disabled?: boolean
    square?: boolean
    type?: 'button' | 'submit' | 'reset'
    ariaLabel?: string
    /** Полиморфизм: кастомный корневой тег/компонент (например, RouterLink). */
    as?: string | Component
    /** Рендерит кнопку как `<a href>` (если не задан `as`). */
    href?: string
    target?: string
    rel?: string
    external?: boolean
  }>(),
  {
    variant: 'primary',
    tone: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    square: false,
    type: 'button',
    ariaLabel: undefined,
    as: undefined,
    href: undefined,
    target: undefined,
    rel: undefined,
    external: false,
  },
)

const isSquare = computed(() => props.square)

// Полиморфный корень: `as` → `<a href>` → `<button>`.
const isLink = computed(() => Boolean(props.as || props.href))
const renderAs = computed<string | Component>(() => {
  if (props.as) return typeof props.as === 'string' ? props.as : markRaw(props.as)
  return props.href ? 'a' : 'button'
})

// Неинтерактивно при явном `disabled` ИЛИ во время `loading`.
const blocked = computed(() => props.disabled || props.loading)

// Ключевое: `loading` НЕ ставит нативный `disabled` (элемент бы выпал из фокуса и
// скринридер потерял бы контекст) — вместо этого `aria-disabled` + перехват клика.
// Нативный `disabled` (только у `<button>`) оставляем лишь для явного `disabled`.
const nativeDisabled = computed(() => (renderAs.value === 'button' && props.disabled) ? true : undefined)
const ariaDisabled = computed(() => (props.loading || (isLink.value && props.disabled)) ? 'true' : undefined)

const resolvedTarget = computed(() => props.target ?? (props.external ? '_blank' : undefined))
const resolvedRel = computed(() => props.rel ?? (resolvedTarget.value === '_blank' ? 'noopener noreferrer' : undefined))

function onClickCapture(e: MouseEvent): void {
  // Блокируем и дефолт (submit/навигация), и внешние обработчики (в т.ч. по Enter/Space),
  // сохраняя фокус на элементе.
  if (blocked.value) {
    e.preventDefault()
    e.stopImmediatePropagation()
  }
}

const squareStyle = computed(() => {
  if (!isSquare.value) return undefined

  const px = (() => {
    if (props.size === 'xs') return 28
    if (props.size === 'sm') return 32
    if (props.size === 'lg') return 44
    return 40
  })()

  const v = `${px}px`
  return {
    width: v,
    minWidth: v,
    height: v,
    padding: '0px',
  } as const
})

const className = computed(() => {
  return grButtonClass({
    variant: props.variant,
    tone: props.tone,
    size: props.size,
    square: isSquare.value,
  })
})
</script>

<template>
  <component
    :is="renderAs"
    data-gr-button
    :data-gr-variant="props.variant"
    :data-gr-tone="props.tone"
    :type="renderAs === 'button' ? props.type : undefined"
    :disabled="nativeDisabled"
    :href="isLink && !props.disabled ? props.href : undefined"
    :target="isLink && !props.disabled ? resolvedTarget : undefined"
    :rel="isLink && !props.disabled ? resolvedRel : undefined"
    :aria-busy="props.loading ? 'true' : undefined"
    :aria-disabled="ariaDisabled"
    :aria-label="props.ariaLabel"
    :tabindex="isLink && props.disabled ? -1 : undefined"
    :class="[grButtonBaseClass, className, blocked ? 'cursor-not-allowed' : '']"
    :style="squareStyle"
    @click.capture="onClickCapture"
  >
    <IconLoader v-if="props.loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot />
  </component>
</template>
