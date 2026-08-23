<script setup lang="ts">
import { computed } from 'vue'

import { grDropdownMenuListClass } from './grDropdownMenuStyles'

/**
 * `role="none"` на обёртке обязателен: `role="menu"` у панели объявляет своих
 * потомков презентационными, и любой div между панелью и пунктом ломает
 * `aria-required-children`, а пункты теряют принадлежность к меню.
 */

export interface GrDropdownMenuListProps {
  dividers?: boolean
  borderTop?: boolean
  borderBottom?: boolean
}

const props = withDefaults(defineProps<GrDropdownMenuListProps>(), {
  dividers: false,
  borderTop: false,
  borderBottom: false,
})

const className = computed(() => grDropdownMenuListClass({
  dividers: props.dividers,
  borderTop: props.borderTop,
  borderBottom: props.borderBottom,
}))

defineSlots<{
  /** Пункты списка меню. */
  default?: () => any
}>()
</script>

<template>
  <div
    data-gr-dropdown-menu-list
    role="none"
    :class="className"
  >
    <slot />
  </div>
</template>
