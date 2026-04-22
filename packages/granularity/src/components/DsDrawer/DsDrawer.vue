<script setup lang="ts">
import { computed, useId } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

import DsButton from '../DsButton/DsButton.vue'
import DsIcon from '../DsIcon/DsIcon.vue'
import {
  dsDrawerPanelClass,
  dsDrawerPanelEnterFrom,
  type DsDrawerSide,
  type DsDrawerSize,
} from './dsDrawerStyles'

import IconClose from '~icons/lucide/x'

export interface DsDrawerProps {
  /** Контроль открытия через v-model. */
  modelValue: boolean
  /** Заголовок; если передан — покажется в хедере. Можно переопределить слотом `#title`. */
  title?: string
  /** Закрывать при клике по бэкдропу / через HeadlessUI close. */
  closeOnBackdrop?: boolean
  /** Закрывать по Esc. */
  closeOnEsc?: boolean
  /** Сторона, с которой выезжает панель. */
  side?: DsDrawerSide
  /** Размер панели. */
  size?: DsDrawerSize
  /** i18n-friendly aria-label для кнопки закрытия. */
  closeLabel?: string
}

const props = withDefaults(defineProps<DsDrawerProps>(), {
  title: undefined,
  closeOnBackdrop: true,
  closeOnEsc: true,
  side: 'right',
  size: 'md',
  closeLabel: 'Close',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const titleId = useId()

const panelClass = computed(() => {
  return dsDrawerPanelClass({ side: props.side, size: props.size })
})

const panelEnterFrom = computed(() => dsDrawerPanelEnterFrom(props.side))

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

function onKeydown(e: KeyboardEvent): void {
  if (e.key !== 'Escape') return
  if (!props.closeOnEsc) return
  e.stopPropagation()
  e.preventDefault()
  close()
}
</script>

<template>
  <teleport to="body">
    <TransitionRoot :show="modelValue" as="template">
      <Dialog
        as="div"
        data-ds-drawer
        class="fixed inset-0 z-50"
        :static="true"
        :aria-labelledby="titleId"
        @close="onDialogClose"
        @keydown="onKeydown"
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
              <div
                data-ds-drawer-header
                class="px-5 py-4 border-b border-[var(--brd)] flex items-center justify-between gap-4"
              >
                <DialogTitle :id="titleId" as="div" data-ds-drawer-title class="text-[14px] font-700 min-w-0 truncate">
                  <slot name="title">
                    {{ title ?? 'Drawer' }}
                  </slot>
                </DialogTitle>

                <DsButton
                  variant="ghost"
                  size="sm"
                  square
                  :aria-label="closeLabel"
                  @click="close"
                >
                  <DsIcon size="sm" aria-hidden="true">
                    <IconClose />
                  </DsIcon>
                </DsButton>
              </div>

              <div data-ds-drawer-body class="flex-1 overflow-y-auto">
                <div class="p-5">
                  <slot />
                </div>
              </div>

              <div
                v-if="$slots.footer"
                data-ds-drawer-footer
                class="px-5 py-4 border-t border-[var(--brd)]"
              >
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </teleport>
</template>
