<script setup lang="ts">
import {computed} from 'vue'

export type DsIconSize = 'sm' | 'md' | 'lg'

const DS_ICON_SIZE_MAP: Record<DsIconSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
}

function resolveDsIconSizePx(size: DsIconSize | number): number {
  if (typeof size === 'number') return size
  return DS_ICON_SIZE_MAP[size]
}

const props = defineProps<{
  size?: DsIconSize | number
}>()

const resolvedSize = computed(() => props.size ?? 'md')

const iconStyle = computed(() => {
  return {
    '--ds-icon-size': `${resolveDsIconSizePx(resolvedSize.value)}px`,
  } as Record<string, string>
})
</script>

<template>
  <span
      data-ds-icon
      class="ds-icon inline-flex items-center justify-center align-middle"
      :style="iconStyle"
  >
    <slot/>
  </span>
</template>
<style>
/*
 * DsIcon.
 *
 * This must be global because icons are usually passed via slots (SVG),
 * and we want consistent sizing without relying on SFC scoped + :deep.
 */
:where(.ds-icon) {
  --ds-icon-size: 18px;
  width: var(--ds-icon-size);
  min-width: var(--ds-icon-size);
  height: var(--ds-icon-size);
  line-height: 0;
  flex: none;
}

:where(.ds-icon svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>