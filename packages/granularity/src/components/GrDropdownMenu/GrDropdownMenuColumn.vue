<script setup lang="ts">
import { alignClass, columnBaseClass, type GrDropdownMenuColumnAlign } from './grDropdownMenuStyles'

export type { GrDropdownMenuColumnAlign } from './grDropdownMenuStyles'

export interface GrDropdownMenuColumnProps {
  align?: GrDropdownMenuColumnAlign
}

withDefaults(defineProps<GrDropdownMenuColumnProps>(), {
  align: 'center',
})

defineSlots<{
  /** Содержимое колонки меню. */
  default?: () => any
}>()
</script>

<template>
  <div
    data-gr-dropdown-menu-column
    role="none"
    :class="[columnBaseClass, alignClass[align]]"
  >
    <slot />
  </div>
</template>
