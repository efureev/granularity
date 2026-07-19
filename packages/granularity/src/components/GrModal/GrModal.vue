<script setup lang="ts">
/**
 * GrModal — GR-примитив модального окна на базе `@headlessui/vue`.
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
 * Esc обрабатывается через общий стек открытых модалок (`grModalEscStack`):
 * единый capture-обработчик на `window` закрывает только верхнюю (последнюю
 * открытую) модалку и опережает window-обработчик Escape HeadlessUI. Это
 * чинит кейс, когда поверх `GrModal` открыт диалог `useDialogService` (другое
 * дерево рендера): Esc закрывает именно верхний диалог, а не нижнее окно.
 * Клик по оверлею (backdrop) по-прежнему идёт через `@close` HeadlessUI;
 * источник закрытия различается через ref `closeReason`.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Dialog, DialogDescription, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

import { pushGrModalEsc, removeGrModalEsc } from './grModalEscStack'
import { pushGrModalTop, removeGrModalTop } from './grModalTopStack'
import { useScrollLock } from '../../composables/internal/useScrollLock'

import {
  type GrModalSize,
  getGrModalPanelClass,
  layout,
  overlay as overlayClass,
  overlayTransition,
  panelTransition,
  root as rootClass,
  shell,
} from './grModalStyles'

export interface GrModalProps {
  modelValue: boolean
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  size?: GrModalSize
}

const props = withDefaults(defineProps<GrModalProps>(), {
  closeOnBackdrop: true,
  closeOnEsc: true,
  size: 'md',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const panelClass = computed(() => getGrModalPanelClass(props.size))

// Ссылка на панель используется как `initialFocus` для HeadlessUI `<Dialog>`:
// панель имеет `tabindex="-1"`, поэтому всегда фокусируема программно. Это
// убирает предупреждение «There are no focusable elements inside the
// <FocusTrap />», которое HeadlessUI выводит, когда не находит фокусируемого
// элемента (в т.ч. когда контент окна временно помечен `inert`).
const panelRef = ref<HTMLElement | null>(null)

// Является ли это окно верхним (последним открытым) в общем стеке модалок.
// Когда поверх открыт другой `GrModal`/диалог сервиса, окно перестаёт быть
// верхним и помечается `inert`, чтобы не «воровать» фокус у верхнего окна.
const isTopmost = ref(true)

// `inert` ставится только на нижние (не верхние) открытые окна. Inert-поддерево
// не интерактивно и не фокусируемо, поэтому FocusLock нижнего `<Dialog>`
// перестаёт возвращать фокус себе — верхний диалог удерживает фокус сам.
const inertAttr = computed(() => (props.modelValue && !isTopmost.value ? '' : undefined))

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

// ————— Esc-стек: гарантирует, что Esc закрывает именно верхнюю (последнюю
// открытую) модалку, даже если окна живут в разных деревьях рендера
// (например, диалоги `useDialogService` поверх `GrModal`).
let escEntryId: number | null = null
let topEntryId: number | null = null

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

function registerTop(): void {
  if (topEntryId !== null) return
  topEntryId = pushGrModalTop({
    setTopmost: (value) => { isTopmost.value = value },
  })
}

function unregisterTop(): void {
  if (topEntryId === null) return
  removeGrModalTop(topEntryId)
  topEntryId = null
  isTopmost.value = true
}

function onOverlayPointerDown(): void {
  closeReason.value = 'backdrop'
}

// ————— Scroll lock на `<body>` на время открытия.
// HeadlessUI Vue этого не делает автоматически, а фон скроллится — для
// GR-примитива это мешающий UX. Общий reference-counted lock корректно
// работает при нескольких открытых оверлеях (LIFO-независимо) и компенсирует
// ширину скроллбара, чтобы контент не дёргался.
const { lock: lockBodyScroll, unlock: unlockBodyScroll } = useScrollLock()

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      lockBodyScroll()
      registerEsc()
      registerTop()
    }
    else {
      unlockBodyScroll()
      unregisterEsc()
      unregisterTop()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  unlockBodyScroll()
  unregisterEsc()
  unregisterTop()
})

</script>

<template>
  <teleport to="body" :disabled="!isClient">
    <TransitionRoot :show="modelValue" as="template">
      <Dialog
        as="div"
        :class="rootClass"
        :initial-focus="panelRef"
        :inert="inertAttr"
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
                data-gr-modal-overlay
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
                ref="panelRef"
                data-gr-modal-panel
                tabindex="-1"
                :class="panelClass"
              >
                <DialogTitle v-if="$slots.title" as="div" data-gr-modal-title>
                  <slot name="title" />
                </DialogTitle>
                <DialogDescription v-if="$slots.description" as="div" data-gr-modal-description>
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
