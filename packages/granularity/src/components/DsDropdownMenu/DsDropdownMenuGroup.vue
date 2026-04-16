<script setup lang="ts">
import { computed } from 'vue'

import DsDropdownMenuHeader from './DsDropdownMenuHeader.vue'
import type { DsDropdownMenuHeaderAlign } from './DsDropdownMenuHeader.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    titleAlign?: DsDropdownMenuHeaderAlign
    dividers?: boolean
    uppercase?: boolean
  }>(),
  {
    title: undefined,
    titleAlign: 'left',
    dividers: false,
    uppercase: true,
  },
)

const itemsClass = computed(() => {
  return [
    'w-full',
    props.dividers ? 'divide-y divide-[var(--brd)]' : '',
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <div class="w-full">
    <DsDropdownMenuHeader
      v-if="props.title"
      :title="props.title"
      :align="props.titleAlign"
      :uppercase="props.uppercase"
    />

    <div :class="itemsClass">
      <slot />
    </div>
  </div>
</template>