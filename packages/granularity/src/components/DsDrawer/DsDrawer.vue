<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

import DsButton from '../DsButton/DsButton.vue'
import { dsDrawerPanelClass, dsDrawerPanelEnterFrom } from './dsDrawerStyles'

import IconClose from '~icons/lucide/x'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    closeOnBackdrop?: boolean
    side?: 'left' | 'right'
    size?: 'sm' | 'md' | 'lg' | 'full'
  }>(),
  {
    title: undefined,
    closeOnBackdrop: true,
    side: 'right',
    size: 'md',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const open = computed(() => props.modelValue)

const panelClass = computed(() => {
  return dsDrawerPanelClass({
    side: props.side,
    size: props.size,
  })
})

const panelEnterFrom = computed(() => {
  return dsDrawerPanelEnterFrom(props.side)
})

function close(): void {
  emit('update:modelValue', false)
}

function onDialogClose(): void {
  if (!props.closeOnBackdrop) return
  close()
}

function onOverlayClick(): void {
  if (!props.closeOnBackdrop) return
  close()
}
</script>

<template>
  <teleport to="body">
    <TransitionRoot :show="open" as="template">
      <Dialog
        as="div"
        class="fixed inset-0 z-50"
        :static="true"
        @close="onDialogClose"
        @keydown.esc.stop.prevent="close"
      >
        <div class="fixed inset-0">
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
              data-ds-drawer-overlay
              class="fixed inset-0 bg-black/40"
              aria-hidden="true"
              @click="onOverlayClick"
            />
          </TransitionChild>

          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            :enter-from="panelEnterFrom"
            enter-to="translate-x-0"
            leave="duration-150 ease-in"
            leave-from="translate-x-0"
            :leave-to="panelEnterFrom"
          >
            <DialogPanel
              data-ds-drawer-panel
              tabindex="-1"
              class="fixed inset-y-0 flex flex-col"
              :class="panelClass"
            >
              <div class="px-5 py-4 border-b border-[var(--brd)] flex items-center justify-between gap-4">
                <DialogTitle as="div" class="text-[14px] font-700 min-w-0 truncate">
                  <slot name="title">
                    {{ props.title ?? 'Drawer' }}
                  </slot>
                </DialogTitle>

                <DsButton
                  variant="ghost"
                  size="sm"
                  square
                  aria-label="Close"
                  @click="close"
                >
                  <IconClose class="h-4 w-4" aria-hidden="true" />
                </DsButton>
              </div>

              <div class="flex-1 overflow-y-auto">
                <div class="p-5">
                  <slot />
                </div>
              </div>

              <div v-if="$slots.footer" class="px-5 py-4 border-t border-[var(--brd)]">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </teleport>
</template>