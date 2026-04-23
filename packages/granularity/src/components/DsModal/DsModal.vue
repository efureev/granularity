<script setup lang="ts">
/**
 * DsModal — DS-примитив модального окна на базе `@headlessui/vue`.
 *
 * Публичный API:
 * - `modelValue` (v-model) — открыто/закрыто;
 * - `size` — размер панели (`sm | md | lg | xl | full`);
 * - `closeOnBackdrop` (default: true) — закрывать при клике по оверлею;
 * - `closeOnEsc` (default: true) — закрывать по Esc;
 * - слоты `#title` / `#description` — если переданы, оборачиваются в
 *   `DialogTitle` / `DialogDescription` (связь через `aria-labelledby` /
 *   `aria-describedby` ставится HeadlessUI автоматически).
 *
 * Esc обрабатывается штатно через событие `@close` у HeadlessUI `<Dialog>`,
 * чтобы не конфликтовать с его внутренней логикой. Источник закрытия
 * различается через ref `closeReasonRef`.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Dialog, DialogDescription, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

import {
  type DsModalSize,
  getDsModalPanelClass,
  layout,
  overlay as overlayClass,
  overlayTransition,
  panelTransition,
  root as rootClass,
  shell,
} from './dsModalStyles'

export interface DsModalProps {
  modelValue: boolean
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  size?: DsModalSize
}

const props = withDefaults(defineProps<DsModalProps>(), {
  closeOnBackdrop: true,
  closeOnEsc: true,
  size: 'md',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const panelClass = computed(() => getDsModalPanelClass(props.size))

// SSR-guard: на сервере `document.body` недоступен — отключаем teleport,
// а в клиенте включаем после маунта.
const isClient = typeof window !== 'undefined'

// Источник закрытия от HeadlessUI `<Dialog>` — либо Esc, либо клик по оверлею.
// Различаем их, чтобы `closeOnBackdrop` и `closeOnEsc` работали независимо.
const closeReason = ref<'backdrop' | 'esc' | null>(null)

function close(): void {
  emit('update:modelValue', false)
}

function onDialogClose(): void {
  const reason = closeReason.value
  closeReason.value = null

  if (reason === 'esc') {
    if (props.closeOnEsc) close()
    return
  }

  // По умолчанию (клик по оверлею или программный вызов `@close`)
  // уважаем `closeOnBackdrop`.
  if (props.closeOnBackdrop) close()
}

function onRootKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') closeReason.value = 'esc'
}

function onOverlayPointerDown(): void {
  closeReason.value = 'backdrop'
}

// ————— Scroll lock на `<body>` на время открытия.
// HeadlessUI Vue этого не делает автоматически, а фон скроллится —
// для DS-примитива это мешающий UX.
let savedBodyOverflow: string | null = null

function lockBodyScroll(): void {
  if (!isClient) return
  if (savedBodyOverflow !== null) return
  savedBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll(): void {
  if (!isClient) return
  if (savedBodyOverflow === null) return
  document.body.style.overflow = savedBodyOverflow
  savedBodyOverflow = null
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) lockBodyScroll()
    else unlockBodyScroll()
  },
  { immediate: true },
)

onBeforeUnmount(unlockBodyScroll)

</script>

<template>
  <teleport to="body" :disabled="!isClient">
    <TransitionRoot :show="modelValue" as="template">
      <Dialog
        as="div"
        :class="rootClass"
        @close="onDialogClose"
        @keydown.capture="onRootKeydown"
      >
        <div :class="shell">
          <div :class="layout">
            <TransitionChild
              as="template"
              :enter="overlayTransition.enter"
              :enter-from="overlayTransition.enterFrom"
              :enter-to="overlayTransition.enterTo"
              :leave="overlayTransition.leave"
              :leave-from="overlayTransition.leaveFrom"
              :leave-to="overlayTransition.leaveTo"
            >
              <div
                data-ds-modal-overlay
                :class="overlayClass"
                aria-hidden="true"
                @pointerdown="onOverlayPointerDown"
              />
            </TransitionChild>

            <TransitionChild
              as="template"
              :enter="panelTransition.enter"
              :enter-from="panelTransition.enterFrom"
              :enter-to="panelTransition.enterTo"
              :leave="panelTransition.leave"
              :leave-from="panelTransition.leaveFrom"
              :leave-to="panelTransition.leaveTo"
            >
              <DialogPanel
                data-ds-modal-panel
                tabindex="-1"
                :class="panelClass"
              >
                <DialogTitle v-if="$slots.title" as="div" data-ds-modal-title>
                  <slot name="title" />
                </DialogTitle>
                <DialogDescription v-if="$slots.description" as="div" data-ds-modal-description>
                  <slot name="description" />
                </DialogDescription>
                <slot />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </teleport>
</template>
