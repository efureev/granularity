<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { headerClass, textAlignClass, type GrDropdownMenuHeaderAlign } from './grDropdownMenuStyles'

export type { GrDropdownMenuHeaderAlign } from './grDropdownMenuStyles'

export interface GrDropdownMenuHeaderProps {
  title?: string
  align?: GrDropdownMenuHeaderAlign
  uppercase?: boolean
}

const props = withDefaults(defineProps<GrDropdownMenuHeaderProps>(), {
  title: undefined,
  align: 'left',
  uppercase: true,
})

/**
 * Заголовок — подпись, а не пункт меню: `role="presentation"` убирает его из
 * числа потомков `role="menu"`. Имя группе он даёт через `aria-labelledby`
 * у `GrDropdownMenuGroup`.
 */
const slots = useSlots()
const isVisible = computed(() => Boolean(props.title) || Boolean(slots.default))

defineSlots<{
  /** Заголовок раздела меню вместо пропа `label`. */
  default?: () => any
}>()

</script>

<template>
  <div
    v-if="isVisible"
    data-gr-dropdown-menu-header
    role="presentation"
    :class="[headerClass, textAlignClass[align], { uppercase }]"
  >
    <slot>{{ title }}</slot>
  </div>
</template>
