<script setup lang="ts">
export interface DsDropdownMenuDividerProps {
  inset?: boolean
}

withDefaults(defineProps<DsDropdownMenuDividerProps>(), {
  inset: false,
})
</script>

<template>
  <div
    data-ds-dropdown-menu-divider
    role="separator"
    class="border-t border-[var(--brd)]"
    :class="inset ? 'mx-2' : ''"
  />
</template>
