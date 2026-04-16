<script setup lang="ts">
import { computed } from 'vue'
import { DialogTitle } from '@headlessui/vue'

import DsModal from '../DsModal/DsModal.vue'
import DsDialogFooter from './DsDialogFooter.vue'
import DsDialogHeader from './DsDialogHeader.vue'
import type { DsDialogSectionConfig, DsDialogSize } from './dialogShared'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    closeOnBackdrop?: boolean
    showHeader?: boolean
    showCloseButton?: boolean
    size?: DsDialogSize
    headerConfig?: DsDialogSectionConfig
    footerConfig?: DsDialogSectionConfig
  }>(),
  {
    title: undefined,
    closeOnBackdrop: true,
    showHeader: true,
    showCloseButton: true,
    size: 'md',
    headerConfig: undefined,
    footerConfig: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const resolvedTitle = computed(() => props.title?.trim() || undefined)

function close(): void {
  open.value = false
}
</script>

<template>
  <DsModal v-model="open" :size="props.size" :close-on-backdrop="props.closeOnBackdrop">
    <DialogTitle v-if="!props.showHeader && resolvedTitle" as="div" class="sr-only">
      {{ resolvedTitle }}
    </DialogTitle>

    <div class="overflow-hidden rounded-[inherit]">
      <DsDialogHeader
        v-if="props.showHeader"
        :title="resolvedTitle"
        :show-close-button="props.showCloseButton"
        :config="props.headerConfig"
        @close="close"
      >
        <template v-if="$slots.header" #default="slotProps">
          <slot name="header" v-bind="slotProps" />
        </template>
      </DsDialogHeader>

      <div class="px-5 py-5">
        <slot />
      </div>

      <DsDialogFooter v-if="$slots.footer" :config="props.footerConfig">
        <slot name="footer" />
      </DsDialogFooter>
    </div>
  </DsModal>
</template>