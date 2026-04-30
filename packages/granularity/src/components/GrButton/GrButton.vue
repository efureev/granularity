<script setup lang="ts">
import { computed } from 'vue'

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
  },
)

const isDisabled = computed(() => props.disabled || props.loading)
const isSquare = computed(() => props.square)

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
  <button
    data-ds-button
    :data-ds-variant="props.variant"
    :data-ds-tone="props.tone"
    :type="props.type"
    :disabled="isDisabled"
    :aria-busy="props.loading ? 'true' : undefined"
    :aria-label="props.ariaLabel"
    :class="[grButtonBaseClass, className]"
    :style="squareStyle"
  >
    <IconLoader v-if="props.loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
