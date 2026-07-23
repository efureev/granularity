<script setup lang="ts">
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
    class="border-t border-[var(--gr-brd)]"
    :class="inset ? 'mx-2' : ''"
  />
</template>
