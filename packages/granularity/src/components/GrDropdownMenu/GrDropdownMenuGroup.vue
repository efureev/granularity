<script setup lang="ts">
import { computed } from 'vue'

import GrDropdownMenuHeader from './GrDropdownMenuHeader.vue'
import type { GrDropdownMenuHeaderAlign } from './GrDropdownMenuHeader.vue'

export interface GrDropdownMenuGroupProps {
  title?: string
  titleAlign?: GrDropdownMenuHeaderAlign
  dividers?: boolean
  uppercase?: boolean
}

const props = withDefaults(defineProps<GrDropdownMenuGroupProps>(), {
  title: undefined,
  titleAlign: 'left',
  dividers: false,
  uppercase: true,
})

const itemsClass = computed(() => {
  return [
    'w-full',
    props.dividers ? 'divide-y divide-[var(--brd)]' : '',
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <div data-ds-dropdown-menu-group class="w-full">
    <GrDropdownMenuHeader
      v-if="title"
      :title="title"
      :align="titleAlign"
      :uppercase="uppercase"
    />
    <div :class="itemsClass">
      <slot />
    </div>
  </div>
</template>
