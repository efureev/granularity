<script setup lang="ts">
import { computed, useSlots } from 'vue'

export type GrDropdownMenuHeaderAlign = 'left' | 'center' | 'right'

export interface GrDropdownMenuHeaderProps {
  title?: string
  align?: GrDropdownMenuHeaderAlign
  uppercase?: boolean
}

const props = withDefaults(defineProps<GrDropdownMenuHeaderProps>(), {
  title: undefined,
  align: 'left',
  uppercase: true,
})

const slots = useSlots()
const isVisible = computed(() => Boolean(props.title) || Boolean(slots.default))

const titleAlignClass = computed(() => {
  const map: Record<GrDropdownMenuHeaderAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return map[props.align]
})
</script>

<template>
  <div
    v-if="isVisible"
    data-ds-dropdown-menu-header
    class="px-4 py-2 text-[11px] tracking-wide text-[var(--muted-fg)]"
    :class="[titleAlignClass, { uppercase }]"
  >
    <slot>{{ title }}</slot>
  </div>
</template>
