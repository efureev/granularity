<script setup lang="ts">
import { colsClass, columnsBaseClass, type GrDropdownMenuColumnsCount } from './grDropdownMenuStyles'

export interface GrDropdownMenuColumnsProps {
  cols?: GrDropdownMenuColumnsCount
}

withDefaults(defineProps<GrDropdownMenuColumnsProps>(), {
  cols: 2,
})

defineSlots<{
  /** Колонки меню (`GrDropdownMenuColumn`). */
  default?: () => any
}>()
</script>

<template>
  <div
    data-gr-dropdown-menu-columns
    role="none"
    :class="[columnsBaseClass, colsClass[cols]]"
  >
    <slot />
  </div>
</template>
