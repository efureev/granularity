<script setup lang="ts">
import DsDropdown from '../DsDropdown/DsDropdown.vue'

import DsDropdownMenuList from './DsDropdownMenuList.vue'

export type DsDropdownMenuAlign = 'left' | 'right' | 'center'
export type DsDropdownMenuWidth = 'auto' | '20' | '48' | '60' | '64' | '80'

const props = withDefaults(
  defineProps<{
    align?: DsDropdownMenuAlign
    width?: DsDropdownMenuWidth
    closeOnContentClick?: boolean
    contentClass?: string

    // list wrapper
    dividers?: boolean
    borderTop?: boolean
    borderBottom?: boolean
    listClass?: string
  }>(),
  {
    align: 'right',
    width: '48',
    closeOnContentClick: true,
    // В `DsDropdown` есть `p-1`, поэтому здесь по умолчанию обнуляем padding,
    // чтобы пункты меню могли растягиваться до границ.
    contentClass: 'p-0',
    dividers: false,
    borderTop: false,
    borderBottom: false,
    listClass: '',
  },
)
</script>

<template>
  <DsDropdown
    :align="props.align"
    :width="props.width"
    :close-on-content-click="props.closeOnContentClick"
    :content-class="props.contentClass"
  >
    <template #trigger="slotProps">
      <slot name="trigger" v-bind="slotProps" />
    </template>

    <template #content="slotProps">
      <DsDropdownMenuList
        :dividers="props.dividers"
        :border-top="props.borderTop"
        :border-bottom="props.borderBottom"
        :class="props.listClass"
      >
        <slot v-bind="slotProps" />
      </DsDropdownMenuList>
    </template>
  </DsDropdown>
</template>