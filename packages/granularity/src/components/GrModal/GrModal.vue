<script setup lang="ts">
/**
 * GrModal — GR-примитив модального окна на базе `@headlessui/vue`.
 *
 * Публичный API:
 * - `modelValue` (v-model) — открыто/закрыто;
 * - `size` — размер панели (`sm | md | lg | xl | full`);
 * - `scrollBehavior` — кто скроллится при длинном содержимом;
 * - `closeOnBackdrop` (default: true) — закрывать при клике по оверлею;
 * - `closeOnEsc` (default: true) — закрывать по Esc;
 * - слоты `#title` / `#description` — если переданы, оборачиваются в
 *   `DialogTitle` / `DialogDescription` (связь через `aria-labelledby` /
 *   `aria-describedby` ставится HeadlessUI автоматически);
 * - слоты `#header` / `#footer` — пустые layout-области вне скроллящегося тела:
 *   при `inside` они остаются на месте. Своей разметки примитив в них не
 *   добавляет — шапку и подвал рисует `GrDialog`.
 *
 * A11y: **имя у модального слоя обязательно**. HeadlessUI связывает
 * `aria-labelledby` только при наличии `DialogTitle`, поэтому окно без слота
 * `#title` осталось бы вовсе без доступного имени (axe: `aria-dialog-name`).
 * Имя берётся из `#title`, иначе из пропа `ariaLabel`, иначе — из i18n, чтобы
 * безымянного окна не получилось ни при каком употреблении.
 *
 * Esc обрабатывается через общий стек слоёв (`useOverlayLayer`), куда
 * регистрируются все оверлеи пакета — и модалки, и панели селектов, дропдаунов,
 * подсказок. Единый capture-обработчик на `window` закрывает только верхний
 * слой и опережает window-обработчик Escape HeadlessUI. Это чинит два кейса:
 * диалог `useDialogService` поверх `GrModal` (другое дерево рендера) и панель,
 * открытую внутри модалки, — Esc адресуется тому, что видит пользователь.
 * Стек гасит Escape в capture-фазе на `window`, поэтому до `<Dialog>` нажатие
 * не доходит вовсе: `@close` от HeadlessUI остаётся только у клика по оверлею
 * и программного вызова, и оба подчиняются `closeOnBackdrop`.
 */
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue'

import { useTeleportEnabled } from '../../composables/internal/useTeleportEnabled'
import { Dialog, DialogDescription, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

import { useOverlayLayer } from '../../composables/useOverlayLayer'
import { useScrollLock } from '../../composables/internal/useScrollLock'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  type GrModalScrollBehavior,
  type GrModalSize,
  getGrModalPanelClass,
  getGrModalShellClass,
  layoutByScroll,
  overlay as overlayClass,
  overlayTransition,
  panelBodyScrollClass,
  panelSectionClass,
  panelTransition,
  root as rootClass,
} from './grModalStyles'

export type { GrModalScrollBehavior }

export interface GrModalProps {
  modelValue: boolean
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  size?: GrModalSize
  /**
   * Кто скроллится при длинном содержимом: весь оверлей (`outside`) или сама
   * панель (`inside` — окно остаётся на месте, шапка и подвал на виду).
   */
  scrollBehavior?: GrModalScrollBehavior
  /**
   * Доступное имя окна, когда заголовка в слоте `#title` нет. Слот сильнее:
   * при нём имя даёт `aria-labelledby` от `DialogTitle`.
   */
  ariaLabel?: string
  /**
   * Элемент, получающий фокус при открытии. По умолчанию — сама панель.
   */
  initialFocus?: HTMLElement | null
}

const props = withDefaults(defineProps<GrModalProps>(), {
  closeOnBackdrop: true,
  closeOnEsc: true,
  size: 'md',
  scrollBehavior: 'outside',
  ariaLabel: undefined,
  initialFocus: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  /** Окно открылось и анимация закончилась. */
  (e: 'opened'): void
  /** Окно закрылось и анимация закончилась — содержимое можно размонтировать. */
  (e: 'closed'): void
}>()

defineSlots<{
  default?: () => any
  title?: () => any
  description?: () => any
  /** Закреплённая шапка: при `inside` остаётся на месте, скроллится только тело. */
  header?: () => any
  /** Закреплённый подвал: там же, где и шапка, — вне скроллящегося тела. */
  footer?: () => any
}>()

const slots = useSlots()

const panelClass = computed(() => getGrModalPanelClass(props.size, props.scrollBehavior))
const shellClass = computed(() => getGrModalShellClass(props.size, props.scrollBehavior))
const layoutClass = computed(() => layoutByScroll[props.scrollBehavior])

// Тело скроллится только при `inside`, и тогда же обязано попадать в таб-порядок:
// длинное содержимое без единого фокусируемого элемента иначе недостижимо с
// клавиатуры (axe: `scrollable-region-focusable`).
const isBodyScrollable = computed(() => props.scrollBehavior === 'inside')

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
// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
// рендер не совпадает с серверным и ломается гидрация (см. композабл).
const teleportEnabled = useTeleportEnabled()

const { t } = useGranularityTranslations()

// Заголовок в слоте — единственный, что HeadlessUI умеет связать сам.
const hasTitle = computed(() => Boolean(slots.title))

// Собственный `aria-label` ставим только в отсутствие заголовка: при обоих
// атрибутах `aria-labelledby` всё равно сильнее, и второе имя было бы шумом.
const ariaLabelAttr = computed(() => {
  if (hasTitle.value) return undefined
  return props.ariaLabel || t('gr.modal.title', 'Dialog')
})

// Обобщённое имя из локали спасает от безымянного окна, но осмысленное имя
// знает только автор. Предупреждаем при первом открытии, а не при монтировании:
// закрытая модалка ещё ничего не нарушила, и ругаться на неё рано.
let missingNameWarned = false

function warnMissingAccessibleName(): void {
  if (missingNameWarned) return
  if (process.env.NODE_ENV === 'production') return
  if (hasTitle.value || props.ariaLabel) return

  missingNameWarned = true
  console.warn(
    '[GrModal] Окно без доступного имени: передайте слот #title или проп ariaLabel. '
    + 'Пока используется обобщённое имя из локали.',
  )
}

function close(): void {
  emit('update:modelValue', false)
}

// Escape до `<Dialog>` не доходит — стек слоёв гасит его в capture-фазе на
// `window`. Значит `@close` остаётся только за кликом по оверлею и программным
// вызовом HeadlessUI, и различать источники больше нечем и незачем.
function onDialogClose(): void {
  if (props.closeOnBackdrop) close()
}

// ————— Esc-стек: гарантирует, что Esc закрывает именно верхнюю (последнюю
// открытую) модалку, даже если окна живут в разных деревьях рендера
// (например, диалоги `useDialogService` поверх `GrModal`).
// Единый стек слоёв: Esc верхнему слою и `inert` нижним модалкам выводятся из
// одного списка. Фокус-ловушку даёт `Dialog` из HeadlessUI — стек её не дублирует.
useOverlayLayer(
  computed(() => props.modelValue),
  close,
  {
    modal: true,
    closeOnEscape: () => props.closeOnEsc,
    onTopmostChange: (value) => { isTopmost.value = value },
    // Фокус возвращает HeadlessUI: у него есть `initialFocus` и restore.
    restoreFocus: false,
  },
)

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
      warnMissingAccessibleName()
      lockBodyScroll()
    }
    else {
      unlockBodyScroll()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  unlockBodyScroll()
})

</script>

<template>
  <teleport to="body" :disabled="!teleportEnabled">
    <TransitionRoot :show="modelValue" as="template">
      <Dialog
        as="div"
        :class="rootClass"
        :initial-focus="initialFocus ?? panelRef"
        :inert="inertAttr"
        :aria-label="ariaLabelAttr"
        @close="onDialogClose"
      >
        <div :class="shellClass">
          <div :class="layoutClass">
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
              />
            </TransitionChild>

            <!-- `opened`/`closed` вешаем на транзишн панели, а не на корневой:
                 анимация живёт здесь, и только её конец что-то значит для
                 потребителя, который ждёт момента для размонтирования. -->
            <TransitionChild
              as="template"
              :enter="panelTransition.enter"
              :enter-from="panelTransition.enterFrom"
              :enter-to="panelTransition.enterTo"
              :leave="panelTransition.leave"
              :leave-from="panelTransition.leaveFrom"
              :leave-to="panelTransition.leaveTo"
              @after-enter="emit('opened')"
              @after-leave="emit('closed')"
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

                <div v-if="$slots.header" data-gr-modal-header :class="panelSectionClass">
                  <slot name="header" />
                </div>

                <!-- При `inside` тело едет отдельно от шапки и подвала: иначе
                     режим ничем не отличался бы от скролла всей панели. -->
                <div
                  v-if="isBodyScrollable"
                  data-gr-modal-body
                  tabindex="0"
                  :class="panelBodyScrollClass"
                >
                  <slot />
                </div>
                <slot v-else />

                <div v-if="$slots.footer" data-gr-modal-footer :class="panelSectionClass">
                  <slot name="footer" />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </teleport>
</template>
