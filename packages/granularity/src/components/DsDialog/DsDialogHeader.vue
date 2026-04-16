<script setup lang="ts">
import { computed } from 'vue'
import { DialogTitle } from '@headlessui/vue'

import DsDialogCloseButton from './DsDialogCloseButton.vue'
import {
  DEFAULT_DS_DIALOG_HEADER_CONFIG,
  resolveDsDialogSectionConfig,
  type DsDialogSectionConfig,
} from './dialogShared'

const props = withDefaults(
  defineProps<{
    title?: string
    showCloseButton?: boolean
    config?: DsDialogSectionConfig
  }>(),
  {
    title: undefined,
    showCloseButton: true,
    config: undefined,
  },
)

defineSlots<{
  default?: (props: { title?: string }) => any
}>()

defineEmits<{
  (e: 'close'): void
}>()

const resolvedTitle = computed(() => props.title?.trim() || undefined)

const resolvedConfig = computed(() => resolveDsDialogSectionConfig(props.config, DEFAULT_DS_DIALOG_HEADER_CONFIG))

const rootClass = computed(() => [
  resolvedConfig.value.paddingX,
  resolvedConfig.value.paddingY,
  resolvedConfig.value.bordered ? 'border-b border-[var(--brd)]' : '',
  'flex items-center justify-between gap-4',
])
</script>

<template>
  <div data-ds-dialog-header :class="rootClass">
    <template v-if="$slots.default">
      <DialogTitle v-if="resolvedTitle" as="div" class="sr-only">
        {{ resolvedTitle }}
      </DialogTitle>

      <div class="flex-1 min-w-0 flex items-center">
        <slot :title="resolvedTitle" />
      </div>
    </template>

    <DialogTitle v-else-if="resolvedTitle" as="div" class="flex-1 min-w-0 text-[14px] font-700">
      {{ resolvedTitle }}
    </DialogTitle>

    <div v-else class="flex-1 min-w-0" />

    <DsDialogCloseButton v-if="props.showCloseButton" @click="$emit('close')" />
  </div>
</template>