<script setup lang="ts">
import { computed } from 'vue'

import { grAvatarClass } from './grAvatarStyles'
import type { GrAvatarShape } from './grAvatarStyles'
import { useGrComponentSize } from '../GrConfigProvider/context'
import type { GrSizeWithPx } from '../shared/sizes'

/** Диаметр аватара для каждой ступени канонической шкалы. */
const GR_AVATAR_SIZE_PX = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
} as const

const props = withDefaults(defineProps<{
  /**
   * Размер по канонической шкале (`xs|sm|md|lg`) — тогда работает
   * `GrConfigProvider`. Число остаётся как escape-hatch: у аватара исторически
   * был произвольный диаметр, и ломать это ради единообразия смысла нет.
   */
  size?: GrSizeWithPx
  src?: string
  alt?: string
  shape?: GrAvatarShape
}>(), {
  size: undefined,
  src: undefined,
  alt: '',
  shape: 'circle',
})

// Числовой размер — «локальное» значение мимо конфига; шкала идёт через провайдер.
const resolvedScaleSize = useGrComponentSize(
  () => (typeof props.size === 'number' ? undefined : props.size),
  { component: 'GrAvatar' },
)

const sizePx = computed(() => (
  typeof props.size === 'number' ? props.size : GR_AVATAR_SIZE_PX[resolvedScaleSize.value]
))

const style = computed(() => {
  const px = `${sizePx.value}px`

  return {
    width: px,
    height: px,
  }
})

const className = computed(() => {
  return grAvatarClass(props.shape)
})
</script>

<template>
  <span :style="style" class="inline-flex items-center justify-center overflow-hidden border border-[var(--gr-brd)] bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] font-700" :class="className">
    <img v-if="props.src" :src="props.src" :alt="props.alt" class="h-full w-full object-cover">
    <slot v-else />
  </span>
</template>