<script setup lang="ts">
import { computed } from 'vue'

import { dsAvatarClass } from './dsAvatarStyles'
import type { DsAvatarShape } from './dsAvatarStyles'

const props = withDefaults(defineProps<{
  size?: number
  src?: string
  alt?: string
  shape?: DsAvatarShape
}>(), {
  size: 40,
  src: undefined,
  alt: '',
  shape: 'circle',
})

const style = computed(() => {
  const px = `${props.size}px`

  return {
    width: px,
    height: px,
  }
})

const className = computed(() => {
  return dsAvatarClass(props.shape)
})
</script>

<template>
  <span :style="style" class="inline-flex items-center justify-center overflow-hidden border border-[var(--brd)] bg-[var(--muted)] text-[var(--muted-fg)] font-700" :class="className">
    <img v-if="props.src" :src="props.src" :alt="props.alt" class="h-full w-full object-cover">
    <slot v-else />
  </span>
</template>