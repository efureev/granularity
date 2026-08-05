<script setup lang="ts">
import { dividerClass, dividerInsetClass } from './grDropdownMenuStyles'

export interface GrDropdownMenuDividerProps {
  inset?: boolean
}

withDefaults(defineProps<GrDropdownMenuDividerProps>(), {
  inset: false,
})
</script>

<template>
  <div
    data-gr-dropdown-menu-divider
    role="separator"
    :class="[dividerClass, inset ? dividerInsetClass : '']"
  />
</template>
