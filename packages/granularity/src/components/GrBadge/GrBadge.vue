<script setup lang="ts">
import { computed } from 'vue'

export type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from './grBadgeStyles'

import {
  grBadgeClass,
  type GrBadgeRadius,
  type GrBadgeSize,
  type GrBadgeTone,
} from './grBadgeStyles'

const props = withDefaults(
  defineProps<{
    tone?: GrBadgeTone
    dark?: boolean
    size?: GrBadgeSize
    radius?: GrBadgeRadius
  }>(),
  {
    tone: 'neutral',
    dark: false,
    size: 'md',
    radius: 'round',
  },
)

const className = computed(() => {
  return grBadgeClass({
    tone: props.tone,
    dark: props.dark,
    size: props.size,
    radius: props.radius,
  })
})
</script>

<template>
  <span class="inline-flex items-center border whitespace-nowrap leading-none" :class="className">
    <slot />
  </span>
</template>