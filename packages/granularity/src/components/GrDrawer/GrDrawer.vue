<script setup lang="ts">
import { computed, onBeforeUnmount, useId, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

import GrButton from '../GrButton/GrButton.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import { useGranularityTranslations } from '../../internal/granularityI18n'
// Переиспользуем инфраструктуру оверлеев GrModal: общий Esc-стек (Esc закрывает
// верхний оверлей независимо от дерева рендера) и reference-counted scroll-lock.
import { pushGrModalEsc, removeGrModalEsc } from '../GrModal/grModalEscStack'
import { useScrollLock } from '../../composables/internal/useScrollLock'
import {
  grDrawerPanelClass,
  grDrawerPanelEnterFrom,
  type GrDrawerSide,
  type GrDrawerSize,
} from './grDrawerStyles'

import IconClose from '~icons/lucide/x'

export interface GrDrawerProps {
  /** Контроль открытия через v-model. */
  modelValue: boolean
  /** Заголовок; если передан — покажется в хедере. Можно переопределить слотом `#title`. */
  title?: string
  /** Закрывать при клике по бэкдропу / через HeadlessUI close. */
  closeOnBackdrop?: boolean
  /** Закрывать по Esc. */
  closeOnEsc?: boolean
  /** Сторона, с которой выезжает панель. */
  side?: GrDrawerSide
  /** Размер панели. */
  size?: GrDrawerSize
  /** i18n-friendly aria-label для кнопки закрытия. */
  closeLabel?: string
}

const props = withDefaults(defineProps<GrDrawerProps>(), {
  title: undefined,
  closeOnBackdrop: true,
  closeOnEsc: true,
  side: 'right',
  size: 'md',
  closeLabel: undefined,
})

const { t } = useGranularityTranslations()
const resolvedTitle = computed(() => props.title ?? t('gr.drawer.title', 'Drawer'))
const resolvedCloseLabel = computed(() => props.closeLabel ?? t('gr.common.close', 'Close'))

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const titleId = useId()

// SSR-guard: на сервере `document.body` недоступен — отключаем teleport
// (в клиенте включаем после маунта). Раньше `<teleport to="body">` без
// `:disabled` падал при SSR — расхождение с GrModal.
const isClient = typeof window !== 'undefined'

const panelClass = computed(() => {
  return grDrawerPanelClass({ side: props.side, size: props.size })
})

const panelEnterFrom = computed(() => grDrawerPanelEnterFrom(props.side))

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

// ————— Esc через общий стек оверлеев + scroll-lock, синхронно с открытием.
const { lock: lockBodyScroll, unlock: unlockBodyScroll } = useScrollLock()

let escEntryId: number | null = null

function registerEsc(): void {
  if (escEntryId !== null) return
  escEntryId = pushGrModalEsc({
    shouldClose: () => props.closeOnEsc,
    close,
  })
}

function unregisterEsc(): void {
  if (escEntryId === null) return
  removeGrModalEsc(escEntryId)
  escEntryId = null
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      lockBodyScroll()
      registerEsc()
    }
    else {
      unlockBodyScroll()
      unregisterEsc()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  unlockBodyScroll()
  unregisterEsc()
})
</script>

<template>
  <teleport to="body" :disabled="!isClient">
    <TransitionRoot :show="modelValue" as="template">
      <Dialog
        as="div"
        data-gr-drawer
        class="fixed inset-0 z-50"
        :static="true"
        :aria-labelledby="titleId"
        @close="onDialogClose"
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
              data-gr-drawer-overlay
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
              data-gr-drawer-panel
              tabindex="-1"
              class="fixed inset-y-0 flex flex-col"
              :class="panelClass"
            >
              <div
                data-gr-drawer-header
                class="px-5 py-4 border-b border-[var(--gr-brd)] flex items-center justify-between gap-4"
              >
                <DialogTitle :id="titleId" as="div" data-gr-drawer-title class="text-[14px] font-700 min-w-0 truncate">
                  <slot name="title">
                    {{ resolvedTitle }}
                  </slot>
                </DialogTitle>

                <GrButton
                  variant="ghost"
                  size="sm"
                  square
                  :aria-label="resolvedCloseLabel"
                  @click="close"
                >
                  <GrIcon size="sm" aria-hidden="true">
                    <IconClose />
                  </GrIcon>
                </GrButton>
              </div>

              <div data-gr-drawer-body class="flex-1 overflow-y-auto">
                <div class="p-5">
                  <slot />
                </div>
              </div>

              <div
                v-if="$slots.footer"
                data-gr-drawer-footer
                class="px-5 py-4 border-t border-[var(--gr-brd)]"
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
