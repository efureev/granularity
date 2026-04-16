<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

export type { DsDialogSize } from './dsModalStyles'

import { getDsModalPanelClass, type DsDialogSize } from './dsModalStyles'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    closeOnBackdrop?: boolean
    size?: DsDialogSize
  }>(),
  {
    closeOnBackdrop: true,
    size: 'md',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const open = computed(() => props.modelValue)

const panelClass = computed(() => getDsModalPanelClass(props.size))

function close(): void {
  emit('update:modelValue', false)
}

function onDialogClose(): void {
  if (props.closeOnBackdrop)
    close()
}
</script>

<template>
  <teleport to="body">
    <TransitionRoot :show="open" as="template">
      <Dialog
        as="div"
        class="fixed inset-0 z-50"
        @close="onDialogClose"
        @keydown.esc.stop.prevent="close"
      >
        <div class="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div class="min-h-full flex items-center justify-center">
            <TransitionChild
              as="template"
              enter="duration-200 ease-out"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="duration-150 ease-in"
              leave-from="opacity-100"
              leave-to="opacity-0"
            >
              <div
                data-ds-modal-overlay
                class="fixed inset-0 z-0 bg-black/40"
                aria-hidden="true"
              />
            </TransitionChild>

            <TransitionChild
              as="template"
              enter="duration-200 ease-out"
              enter-from="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="duration-150 ease-in"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                data-ds-modal-panel
                tabindex="-1"
                :class="panelClass"
              >
                <slot />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </teleport>
</template>