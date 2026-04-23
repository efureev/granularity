<script setup lang="ts">
export type DsDropdownMenuColumnAlign = 'left' | 'center' | 'right'

export interface DsDropdownMenuColumnProps {
  align?: DsDropdownMenuColumnAlign
}

withDefaults(defineProps<DsDropdownMenuColumnProps>(), {
  align: 'center',
})

const alignClass: Record<DsDropdownMenuColumnAlign, string> = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
}
</script>

<template>
  <div
    data-ds-dropdown-menu-column
    class="px-3 py-2 flex items-center"
    :class="alignClass[align]"
  >
    <slot />
  </div>
</template>
