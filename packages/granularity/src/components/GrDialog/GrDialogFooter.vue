<script setup lang="ts">
import { computed } from 'vue'

import {
  DEFAULT_GR_DIALOG_FOOTER_CONFIG,
  resolveGrDialogSectionConfig,
  type GrDialogSectionConfig,
} from './dialogShared'

export interface GrDialogFooterProps {
  config?: GrDialogSectionConfig
}

const props = withDefaults(defineProps<GrDialogFooterProps>(), {
  config: undefined,
})

const resolvedConfig = computed(() => resolveGrDialogSectionConfig(props.config, DEFAULT_GR_DIALOG_FOOTER_CONFIG))

const rootClass = computed(() => [
  resolvedConfig.value.paddingX,
  resolvedConfig.value.paddingY,
  resolvedConfig.value.bordered ? 'border-t border-[var(--brd)]' : '',
])
</script>

<template>
  <div data-ds-dialog-footer :class="rootClass">
    <slot />
  </div>
</template>