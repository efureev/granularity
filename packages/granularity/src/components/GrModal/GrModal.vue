<script setup lang="ts">
/**
 * GrModal — GR-примитив модального окна.
 *
 * Публичный API:
 * - `modelValue` (v-model) — открыто/закрыто;
 * - `size` — размер панели (`sm | md | lg | xl | full`);
 * - `scrollBehavior` — кто скроллится при длинном содержимом;
 * - `closeOnBackdrop` (default: true) — закрывать при клике по оверлею;
 * - `closeOnEsc` (default: true) — закрывать по Esc;
 * - слоты `#title` / `#description` — получают id и связываются с окном через
 *   `aria-labelledby` / `aria-describedby`;
 * - слоты `#header` / `#footer` — пустые layout-области вне скроллящегося тела:
 *   при `inside` они остаются на месте. Своей разметки примитив в них не
 *   добавляет — шапку и подвал рисует `GrDialog`.
 *
 * A11y: **имя у модального слоя обязательно**. Имя берётся из `#title` (или из
 * заголовка `GrDialog`, который заявляет себя тем же контекстом), иначе из
 * пропа `ariaLabel`, иначе — из i18n, чтобы безымянного окна не получилось ни
 * при каком употреблении (axe: `aria-dialog-name`).
 *
 * Механика слоя собрана из примитивов пакета:
 * - `useOverlayLayer` — место в общем стеке: Esc верхнему слою, `inert` нижним
 *   окнам, возврат фокуса на триггер. Стек видит слои из разных деревьев
 *   рендера (диалоги `useDialogService` монтируются отдельным `render()`);
 * - `useFocusTrap` — Tab по кругу внутри окна. Панель селекта, открытого
 *   изнутри, телепортирована в `body`, поэтому ловушке отдаются корни слоёв
 *   выше (`rootsAbove`) — иначе она отбирала бы у такой панели фокус;
 * - `useInertOthers` — остальная страница уходит из таб-порядка и из дерева
 *   доступности;
 * - `useOverlayPresence` — поддерево живёт до конца leave-анимации.
 */
import { useGrComponentProp, useGrThemeAttrs } from '../GrConfigProvider/context'
import { computed, onBeforeUnmount, ref, useId, useSlots, watch } from 'vue'

import { useTeleportEnabled } from '../../composables/internal/useTeleportEnabled'

import { useFocusTrap } from '../../composables/useFocusTrap'
import { useInertOthers } from '../../composables/internal/useInertOthers'
import { useOverlayLayer } from '../../composables/useOverlayLayer'
import { useOverlayPresence } from '../../composables/internal/useOverlayPresence'
import { useScrollLock } from '../../composables/internal/useScrollLock'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { provideGrModalContext } from './context'

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
   * при нём имя даёт `aria-labelledby`.
   */
  ariaLabel?: string
  /**
   * Элемент, получающий фокус при открытии. По умолчанию — сама панель: она
   * фокусируема программно (`tabindex="-1"`), диктор объявляет окно целиком, а
   * первый Tab приводит в начало содержимого.
   */
  initialFocus?: HTMLElement | null
}

import './defaults'

const props = withDefaults(defineProps<GrModalProps>(), {
  closeOnBackdrop: true,
  closeOnEsc: true,
  // Дефолт `size` живёт в резолвере ниже, а не здесь: Vue подставил бы его
  // до того, как компонент заглянет в `GrConfigProvider`.
  size: undefined,
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

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentProp('GrModal', 'size', () => props.size, 'md')

const panelClass = computed(() => getGrModalPanelClass(resolvedSize.value, props.scrollBehavior))
const shellClass = computed(() => getGrModalShellClass(resolvedSize.value, props.scrollBehavior))
const layoutClass = computed(() => layoutByScroll[props.scrollBehavior])

// Тело скроллится только при `inside`, и тогда же обязано попадать в таб-порядок:
// длинное содержимое без единого фокусируемого элемента иначе недостижимо с
// клавиатуры (axe: `scrollable-region-focusable`).
const isBodyScrollable = computed(() => props.scrollBehavior === 'inside')

const rootEl = ref<HTMLElement | null>(null)
// Панель фокусируема программно (`tabindex="-1"`) — это и приёмник фокуса по
// умолчанию, и запасной, когда фокусировать внутри нечего.
const panelRef = ref<HTMLElement | null>(null)

// Является ли это окно верхним (последним открытым) в общем стеке модалок.
// Когда поверх открыт другой `GrModal`/диалог сервиса, окно перестаёт быть
// верхним и помечается `inert`, чтобы не «воровать» фокус у верхнего окна.
const isTopmost = ref(true)

const inertAttr = computed(() => (props.modelValue && !isTopmost.value ? true : undefined))

// SSR-guard: на сервере `document.body` недоступен — отключаем teleport,
// а в клиенте включаем после маунта.
// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
// рендер не совпадает с серверным и ломается гидрация (см. композабл).
const teleportEnabled = useTeleportEnabled()

// Тема поддерева на телепортированную панель: в DOM она уезжает в `body`, то
// есть вне обёртки провайдера, и `data-theme` с неё не наследуется. В дереве
// компонентов панель остаётся внутри — `inject` доходит, и тему она ставит себе
// сама.
const themeAttrs = useGrThemeAttrs()

const { t } = useGranularityTranslations()

// ————— Имя и описание окна.
// Id принадлежат окну и раздаются вниз контекстом: заголовок рисует либо слот
// `#title`, либо `GrDialogHeader` глубже по дереву, и оба лишь заявляют, что
// отрисовались. Обратное владение (id рождается у заголовка) мутировало бы
// состояние окна во время его же патча — см. `context.ts`.
const titleId = useId()
const descriptionId = useId()

const hasTitle = ref(false)
const hasDescription = ref(false)

// Счётчики намеренно не реактивные: наружу торчит только «заголовок есть».
// Пересоздание содержимого слота меняет счётчик, но не флаг, и лишнего рендера
// окна не случается.
let titleClaims = 0
let descriptionClaims = 0

function claim(add: () => void, remove: () => void): () => void {
  add()
  let released = false
  return () => {
    if (released) return
    released = true
    remove()
  }
}

function claimTitle(): () => void {
  return claim(
    () => { titleClaims += 1; hasTitle.value = true },
    () => { titleClaims -= 1; hasTitle.value = titleClaims > 0 },
  )
}

function claimDescription(): () => void {
  return claim(
    () => { descriptionClaims += 1; hasDescription.value = true },
    () => { descriptionClaims -= 1; hasDescription.value = descriptionClaims > 0 },
  )
}

provideGrModalContext({ titleId, descriptionId, claimTitle, claimDescription })

// Собственные слоты заявляются тем же путём, что и заголовок `GrDialog`.
let releaseOwnTitle: (() => void) | undefined
let releaseOwnDescription: (() => void) | undefined

watch(
  () => Boolean(slots.title),
  (has) => {
    releaseOwnTitle?.()
    releaseOwnTitle = has ? claimTitle() : undefined
  },
  { immediate: true },
)

watch(
  () => Boolean(slots.description),
  (has) => {
    releaseOwnDescription?.()
    releaseOwnDescription = has ? claimDescription() : undefined
  },
  { immediate: true },
)

const labelledBy = computed(() => (hasTitle.value ? titleId : undefined))
const describedBy = computed(() => (hasDescription.value ? descriptionId : undefined))

// Собственный `aria-label` ставим только в отсутствие заголовка: при обоих
// атрибутах `aria-labelledby` всё равно сильнее, и второе имя было бы шумом.
const ariaLabelAttr = computed(() => {
  if (labelledBy.value) return undefined
  return props.ariaLabel || t('gr.modal.title', 'Dialog')
})

// Обобщённое имя из локали спасает от безымянного окна, но осмысленное имя
// знает только автор. Предупреждаем при первом открытии, а не при монтировании:
// закрытая модалка ещё ничего не нарушила, и ругаться на неё рано.
let missingNameWarned = false

function warnMissingAccessibleName(): void {
  if (missingNameWarned) return
  if (process.env.NODE_ENV === 'production') return
  if (slots.title || props.ariaLabel) return

  missingNameWarned = true
  console.warn(
    '[GrModal] Окно без доступного имени: передайте слот #title или проп ariaLabel. '
    + 'Пока используется обобщённое имя из локали.',
  )
}

// Два заголовка на окно — это разъехавшийся `aria-labelledby`: диктор прочитает
// первый, а автор будет уверен во втором.
function warnDuplicateTitle(): void {
  if (process.env.NODE_ENV === 'production') return
  if (titleClaims <= 1) return

  console.warn(
    '[GrModal] На окно заявлено несколько заголовков — имя берётся от первого. '
    + 'Оставьте один: слот #title у GrModal либо заголовок GrDialog.',
  )
}

function close(): void {
  emit('update:modelValue', false)
}

// ————— Клик по подложке.
// Считается только клик, НАЧАВШИЙСЯ на подложке: иначе выделение текста в
// панели, отпущенное за её границей, закрывало бы окно вместе с выделением.
let pointerDownOnOverlay = false

function onOverlayPointerDown(event: MouseEvent): void {
  pointerDownOnOverlay = event.target === event.currentTarget
}

function onOverlayClick(event: MouseEvent): void {
  const startedHere = pointerDownOnOverlay
  pointerDownOnOverlay = false

  if (!startedHere || event.target !== event.currentTarget) return
  if (!props.closeOnBackdrop) return
  close()
}

// ————— Присутствие в DOM отдельно от видимости: поддерево живёт до конца
// leave-анимации панели.
const {
  mounted: isMounted,
  visible: isVisible,
  onPanelAfterLeave: releasePresence,
} = useOverlayPresence(computed(() => props.modelValue))

function onPanelAfterLeave(): void {
  releasePresence()
  emit('closed')
}

// ————— Слой: Esc верхнему, `inert` нижним окнам, возврат фокуса на триггер.
const layer = useOverlayLayer(
  computed(() => props.modelValue),
  close,
  {
    modal: true,
    closeOnEscape: () => props.closeOnEsc,
    onTopmostChange: (value) => { isTopmost.value = value },
    root: rootEl,
  },
)

// Ловушка молчит, пока окно не верхнее: фокусом распоряжается то, что открыто
// поверх. Корни слоёв выше считаются своими — панель селекта, открытого внутри
// окна, лежит в `body` отдельным поддеревом.
useFocusTrap(panelRef, {
  active: () => props.modelValue && isTopmost.value,
  initialFocus: () => props.initialFocus ?? panelRef.value,
  fallbackFocus: () => panelRef.value,
  containers: layer.rootsAbove,
  // Возврат фокуса — за стеком слоёв: у него правило строже (только если на
  // момент закрытия фокус ещё внутри слоя).
  restoreFocus: false,
})

useInertOthers(rootEl, () => props.modelValue && isTopmost.value)

// ————— Scroll lock на `<body>` на время открытия.
// Общий reference-counted lock корректно работает при нескольких открытых
// оверлеях (LIFO-независимо) и компенсирует ширину скроллбара, чтобы контент не
// дёргался.
const { lock: lockBodyScroll, unlock: unlockBodyScroll } = useScrollLock()

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      warnMissingAccessibleName()
      warnDuplicateTitle()
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
    <div
      v-if="teleportEnabled && isMounted"
      ref="rootEl"
      data-gr-overlay-root
      v-bind="themeAttrs"
      role="dialog"
      aria-modal="true"
      :class="rootClass"
      :inert="inertAttr"
      :aria-labelledby="labelledBy"
      :aria-describedby="describedBy"
      :aria-label="ariaLabelAttr"
    >
      <div :class="shellClass">
        <div :class="layoutClass">
          <Transition
            appear
            :enter-active-class="overlayTransition.enter"
            :enter-from-class="overlayTransition.enterFrom"
            :enter-to-class="overlayTransition.enterTo"
            :leave-active-class="overlayTransition.leave"
            :leave-from-class="overlayTransition.leaveFrom"
            :leave-to-class="overlayTransition.leaveTo"
          >
            <div
              v-if="isVisible"
              data-gr-modal-overlay
              :class="overlayClass"
              aria-hidden="true"
              @mousedown="onOverlayPointerDown"
              @click="onOverlayClick"
            />
          </Transition>

          <!-- `opened`/`closed` вешаем на транзишн панели, а не на корневой:
               анимация живёт здесь, и только её конец что-то значит для
               потребителя, который ждёт момента для размонтирования. -->
          <Transition
            appear
            :enter-active-class="panelTransition.enter"
            :enter-from-class="panelTransition.enterFrom"
            :enter-to-class="panelTransition.enterTo"
            :leave-active-class="panelTransition.leave"
            :leave-from-class="panelTransition.leaveFrom"
            :leave-to-class="panelTransition.leaveTo"
            @after-enter="emit('opened')"
            @after-leave="onPanelAfterLeave"
          >
            <div
              v-if="isVisible"
              ref="panelRef"
              data-gr-modal-panel
              tabindex="-1"
              :class="panelClass"
            >
              <div v-if="$slots.title" :id="titleId" data-gr-modal-title>
                <slot name="title" />
              </div>
              <div v-if="$slots.description" :id="descriptionId" data-gr-modal-description>
                <slot name="description" />
              </div>

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
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </teleport>
</template>
