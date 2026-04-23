<script setup lang="ts">
import { computed } from 'vue'

import {
  DEFAULT_DS_DIALOG_FOOTER_CONFIG,
  resolveDsDialogSectionConfig,
  type DsDialogSectionConfig,
} from './dialogShared'

export interface DsDialogFooterProps {
  config?: DsDialogSectionConfig
}

const props = withDefaults(defineProps<DsDialogFooterProps>(), {
  config: undefined,
})

const resolvedConfig = computed(() => resolveDsDialogSectionConfig(props.config, DEFAULT_DS_DIALOG_FOOTER_CONFIG))

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