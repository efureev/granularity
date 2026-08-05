<script setup lang="ts">
import { computed, useId } from 'vue'

import GrDropdownMenuHeader from './GrDropdownMenuHeader.vue'
import { dividersClass, listBaseClass, type GrDropdownMenuHeaderAlign } from './grDropdownMenuStyles'

export interface GrDropdownMenuGroupProps {
  title?: string
  titleAlign?: GrDropdownMenuHeaderAlign
  dividers?: boolean
  uppercase?: boolean
}

const props = withDefaults(defineProps<GrDropdownMenuGroupProps>(), {
  title: undefined,
  titleAlign: 'left',
  dividers: false,
  uppercase: true,
})

const titleId = useId()
// Имя группы читается диктором при входе в неё; без заголовка называть нечем.
const labelledBy = computed(() => (props.title ? titleId : undefined))

const itemsClass = computed(() => [
  listBaseClass,
  props.dividers ? dividersClass : '',
].filter(Boolean).join(' '))
</script>

<template>
  <div
    data-gr-dropdown-menu-group
    role="group"
    :aria-labelledby="labelledBy"
    class="w-full"
  >
    <GrDropdownMenuHeader
      v-if="title"
      :id="titleId"
      :title="title"
      :align="titleAlign"
      :uppercase="uppercase"
    />
    <div role="none" :class="itemsClass">
      <slot />
    </div>
  </div>
</template>
