<script setup lang="ts">
import GrDropdown from '../GrDropdown/GrDropdown.vue'

import GrDropdownMenuList from './GrDropdownMenuList.vue'

export type GrDropdownMenuAlign = 'left' | 'right' | 'center'
export type GrDropdownMenuWidth = 'auto' | '20' | '48' | '60' | '64' | '80'

export interface GrDropdownMenuProps {
  /** Выравнивание панели относительно триггера. */
  align?: GrDropdownMenuAlign
  /** Ширина панели. */
  width?: GrDropdownMenuWidth
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

withDefaults(defineProps<GrDropdownMenuProps>(), {
  align: 'right',
  width: '48',
  closeOnContentClick: true,
  // В `GrDropdown` есть `p-1`, поэтому здесь по умолчанию обнуляем padding,
  // чтобы пункты меню могли растягиваться до границ.
  contentClass: 'p-0',
  dividers: false,
  borderTop: false,
  borderBottom: false,
  listClass: '',
})
</script>

<template>
  <GrDropdown
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
      <GrDropdownMenuList
        :dividers="dividers"
        :border-top="borderTop"
        :border-bottom="borderBottom"
        :class="listClass"
      >
        <slot v-bind="slotProps" />
      </GrDropdownMenuList>
    </template>
  </GrDropdown>
</template>
