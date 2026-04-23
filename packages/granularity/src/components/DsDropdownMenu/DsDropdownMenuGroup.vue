<script setup lang="ts">
import { computed } from 'vue'

import DsDropdownMenuHeader from './DsDropdownMenuHeader.vue'
import type { DsDropdownMenuHeaderAlign } from './DsDropdownMenuHeader.vue'

export interface DsDropdownMenuGroupProps {
  title?: string
  titleAlign?: DsDropdownMenuHeaderAlign
  dividers?: boolean
  uppercase?: boolean
}

const props = withDefaults(defineProps<DsDropdownMenuGroupProps>(), {
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
    <DsDropdownMenuHeader
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
