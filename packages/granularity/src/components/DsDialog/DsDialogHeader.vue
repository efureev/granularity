<script setup lang="ts">
import { computed } from 'vue'
import { DialogTitle } from '@headlessui/vue'

import DsDialogCloseButton from './DsDialogCloseButton.vue'
import {
  DEFAULT_DS_DIALOG_HEADER_CONFIG,
  type DsDialogSectionConfig,
  resolveDsDialogSectionConfig,
  resolveDsDialogTitle,
} from './dialogShared'

export interface DsDialogHeaderProps {
  title?: string
  showCloseButton?: boolean
  config?: DsDialogSectionConfig
  /** A11y-лейбл кнопки закрытия (i18n). */
  closeLabel?: string
}

const props = withDefaults(defineProps<DsDialogHeaderProps>(), {
  title: undefined,
  showCloseButton: true,
  config: undefined,
  closeLabel: 'Close',
})

const slots = defineSlots<{
  default?: (props: { title?: string }) => any
}>()

defineEmits<{
  (e: 'close'): void
}>()

const resolvedTitle = computed(() => resolveDsDialogTitle(props.title))

const resolvedConfig = computed(() =>
  resolveDsDialogSectionConfig(props.config, DEFAULT_DS_DIALOG_HEADER_CONFIG),
)

const rootClass = computed(() => [
  resolvedConfig.value.paddingX,
  resolvedConfig.value.paddingY,
  resolvedConfig.value.bordered ? 'border-b border-[var(--brd)]' : '',
  'flex items-center justify-between gap-4',
])

// Видимый `DialogTitle` рендерим только когда нет пользовательского слота:
// если слот `#header` задан, a11y-title отдаётся через `DsModal #title`
// на уровне `DsDialog` (см. JSDoc у `DsDialog.vue`).
const showVisibleTitle = computed(() => !slots.default && !!resolvedTitle.value)
</script>

<template>
  <div data-ds-dialog-header :class="rootClass">
    <template v-if="slots.default">
      <div class="flex-1 min-w-0 flex items-center">
        <slot :title="resolvedTitle" />
      </div>
    </template>
    <DialogTitle
      v-else-if="showVisibleTitle"
      as="div"
      class="flex-1 min-w-0 text-[14px] font-700"
    >
      {{ resolvedTitle }}
    </DialogTitle>
    <div v-else class="flex-1 min-w-0" />
    <DsDialogCloseButton
      v-if="showCloseButton"
      :aria-label="closeLabel"
      @click="$emit('close')"
    />
  </div>
</template>
