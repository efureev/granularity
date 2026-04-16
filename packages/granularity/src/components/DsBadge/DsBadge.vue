<script setup lang="ts">
import { computed } from 'vue'

export type { DsBadgeRadius, DsBadgeSize, DsBadgeTone } from './dsBadgeStyles'

import {
  dsBadgeClass,
  type DsBadgeRadius,
  type DsBadgeSize,
  type DsBadgeTone,
} from './dsBadgeStyles'

const props = withDefaults(
  defineProps<{
    tone?: DsBadgeTone
    dark?: boolean
    size?: DsBadgeSize
    radius?: DsBadgeRadius
  }>(),
  {
    tone: 'neutral',
    dark: false,
    size: 'md',
    radius: 'round',
  },
)

const className = computed(() => {
  return dsBadgeClass({
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