<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'

defineOptions({
  inheritAttrs: false,
})

export type DsDropdownMenuItemAlign = 'left' | 'center' | 'right'
export type DsDropdownMenuItemVariant = 'default' | 'danger'

export interface DsDropdownMenuItemProps {
  as?: string | Component
  disabled?: boolean
  align?: DsDropdownMenuItemAlign
  variant?: DsDropdownMenuItemVariant
}

const props = withDefaults(defineProps<DsDropdownMenuItemProps>(), {
  as: 'button',
  disabled: false,
  align: 'left',
  variant: 'default',
})

const attrs = useAttrs()

const isNativeButton = computed(() => props.as === 'button' || props.as === undefined)

const alignClass = computed(() => {
  const map: Record<DsDropdownMenuItemAlign, string> = {
    left: 'justify-start text-left',
    center: 'justify-center text-center',
    right: 'justify-end text-right',
  }

  return map[props.align]
})

const variantClass = computed(() => {
  if (props.variant === 'danger')
    return 'text-[var(--ds-danger)]'

  return 'text-[var(--fg)]'
})

const disabledClass = computed(() => {
  if (!props.disabled)
    return ''

  return 'cursor-not-allowed opacity-60 pointer-events-none'
})

const interactiveClass = computed(() => {
  if (props.disabled)
    return ''

  return 'hover:bg-[var(--accent)] hover:text-[var(--accent-fg)]'
})

const className = computed(() => {
  return [
    // block/flex + размеры
    'w-full min-h-[40px] px-4 py-2.5',
    'flex items-center gap-2',
    // типографика
    'text-[13px]',
    // взаимодействие
    'transition-colors duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
    alignClass.value,
    variantClass.value,
    interactiveClass.value,
    disabledClass.value,
  ].filter(Boolean).join(' ')
})

function onClickCapture(e: MouseEvent) {
  if (!props.disabled)
    return

  e.preventDefault()
  e.stopPropagation()
}
</script>

<template>
  <component
    :is="as"
    v-bind="attrs"
    data-ds-dropdown-menu-item
    :class="className"
    :type="isNativeButton ? (attrs.type as any) ?? 'button' : undefined"
    :disabled="isNativeButton ? disabled : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : (attrs.tabindex as any)"
    @click.capture="onClickCapture"
  >
    <slot />
  </component>
</template>