<script setup lang="ts">
import DsDropdown from '../DsDropdown/DsDropdown.vue'

import DsDropdownMenuList from './DsDropdownMenuList.vue'

export type DsDropdownMenuAlign = 'left' | 'right' | 'center'
export type DsDropdownMenuWidth = 'auto' | '20' | '48' | '60' | '64' | '80'

export interface DsDropdownMenuProps {
  /** Выравнивание панели относительно триггера. */
  align?: DsDropdownMenuAlign
  /** Ширина панели. */
  width?: DsDropdownMenuWidth
  /** Закрывать по клику внутри content. */
  closeOnContentClick?: boolean
  /** Дополнительные классы content-контейнера; по умолчанию `p-0`. */
  contentClass?: string

  // list wrapper
  /** Разделители между пунктами. */
  dividers?: boolean
  /** Верхний бордер контейнера списка. */
  borderTop?: boolean
  /** Нижний бордер контейнера списка. */
  borderBottom?: boolean
  /** Дополнительные классы для wrapper'а списка. */
  listClass?: string
}

withDefaults(defineProps<DsDropdownMenuProps>(), {
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
})
</script>

<template>
  <DsDropdown
    data-ds-dropdown-menu
    :align="align"
    :width="width"
    :close-on-content-click="closeOnContentClick"
    :content-class="contentClass"
  >
    <template #trigger="slotProps">
      <slot name="trigger" v-bind="slotProps" />
    </template>

    <template #content="slotProps">
      <DsDropdownMenuList
        :dividers="dividers"
        :border-top="borderTop"
        :border-bottom="borderBottom"
        :class="listClass"
      >
        <slot v-bind="slotProps" />
      </DsDropdownMenuList>
    </template>
  </DsDropdown>
</template>
