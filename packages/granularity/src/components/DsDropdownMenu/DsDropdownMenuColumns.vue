<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    cols?: 2 | 3 | 4
  }>(),
  {
    cols: 2,
  },
)

const colsClass = computed(() => {
  return {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[props.cols]
})
</script>

<template>
  <div class="w-full grid divide-x divide-[var(--brd)]" :class="colsClass">
    <slot />
  </div>
</template>