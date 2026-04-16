<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    dividers?: boolean
    borderTop?: boolean
    borderBottom?: boolean
  }>(),
  {
    dividers: false,
    borderTop: false,
    borderBottom: false,
  },
)

const className = computed(() => {
  return [
    'w-full',
    props.dividers ? 'divide-y divide-[var(--brd)]' : '',
    props.borderTop ? 'border-t border-[var(--brd)]' : '',
    props.borderBottom ? 'border-b border-[var(--brd)]' : '',
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <div :class="className">
    <slot />
  </div>
</template>