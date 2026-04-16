<script setup lang="ts">
import { computed } from 'vue'

export type { DsIconSize } from './dsIconStyles'

import { resolveDsIconSizePx, type DsIconSize } from './dsIconStyles'

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
    v-bind="$attrs"
  >
    <slot />
  </span>
</template>