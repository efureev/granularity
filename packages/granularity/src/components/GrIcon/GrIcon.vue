<script setup lang="ts">
import type { GrComponentSize } from '../shared/sizes'
import {computed} from 'vue'
import { useGrComponentSize } from '../GrConfigProvider/context'

export type GrIconSize = GrComponentSize

const GR_ICON_SIZE_MAP: Record<GrIconSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
}

function resolveGrIconSizePx(size: GrIconSize | number): number {
  if (typeof size === 'number') return size
  return GR_ICON_SIZE_MAP[size]
}

const props = defineProps<{
  size?: GrIconSize | number
}>()

// Число — «локальный» escape-hatch мимо конфига; шкала идёт через провайдер.
const resolvedScaleSize = useGrComponentSize(
  () => (typeof props.size === 'number' ? undefined : props.size),
  { component: 'GrIcon' },
)

const resolvedSize = computed(() => (typeof props.size === 'number' ? props.size : resolvedScaleSize.value))

const iconStyle = computed(() => {
  return {
    '--gr-icon-size': `${resolveGrIconSizePx(resolvedSize.value)}px`,
  } as Record<string, string>
})
</script>

<template>
  <span
      data-gr-icon
      class="gr-icon inline-flex items-center justify-center align-middle"
      :style="iconStyle"
  >
    <slot />
  </span>
</template>
<style>
/*
 * GrIcon.
 *
 * This must be global because icons are usually passed via slots (SVG),
 * and we want consistent sizing without relying on SFC scoped + :deep.
 */
:where(.gr-icon) {
  --gr-icon-size: 18px;
  width: var(--gr-icon-size);
  min-width: var(--gr-icon-size);
  height: var(--gr-icon-size);
  line-height: 0;
  flex: none;
}

:where(.gr-icon svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>