<script setup lang="ts">
import { computed } from 'vue'

export interface GrDropdownMenuListProps {
  dividers?: boolean
  borderTop?: boolean
  borderBottom?: boolean
}

const props = withDefaults(defineProps<GrDropdownMenuListProps>(), {
  dividers: false,
  borderTop: false,
  borderBottom: false,
})

const className = computed(() => {
  return [
    'w-full',
    props.dividers ? 'divide-y divide-[var(--brd)]' : '',
    props.borderTop ? 'border-t border-[var(--brd)]' : '',
    props.borderBottom ? 'border-b border-[var(--brd)]' : '',
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <div data-ds-dropdown-menu-list :class="className">
    <slot />
  </div>
</template>
