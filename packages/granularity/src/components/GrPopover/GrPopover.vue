<script setup lang="ts">
/**
 * GrPopover — якорный немодальный оверлей с произвольным содержимым.
 *
 * Роль «универсального поповера» до сих пор насильно исполнял `GrDropdown`, но
 * он про меню: жёстко объявляет `role="menu"`, `aria-haspopup="menu"` и водит
 * фокус по пунктам. Для формы, подтверждения или палитры это неверная семантика.
 *
 * Здесь наоборот: позиционирование, слой и закрытие берёт на себя примитив, а
 * клавиатурный паттерн внутри панели остаётся за потребителем — поэтому `role`
 * задаётся пропом. На этом собираются `GrMenu` / `GrContextMenu` /
 * `GrColorPicker` / Popconfirm.
 *
 * A11y:
 * - триггер получает `aria-haspopup`/`aria-expanded`/`aria-controls` через
 *   `triggerProps` (биндится на реальный фокусируемый элемент в слоте);
 * - панель — `role="dialog"` по умолчанию и обязательное доступное имя
 *   (`ariaLabel` либо `aria-labelledby` через `labelledBy`);
 * - Esc закрывает верхний слой стека, клик вне — закрывает по точке попадания;
 * - **по умолчанию фокус-ловушки нет намеренно**: Tab обязан уводить фокус
 *   наружу, иначе немодальный слой запирает пользователя на странице, которая
 *   не заблокирована. Проп `modal` включает второй режим — см. ниже.
 */
import { computed, nextTick, ref, useId, useSlots, watch } from 'vue'

import { useControlledOpen } from '../../composables/internal/useControlledOpen'
import { useModalOverlay } from '../../composables/internal/useModalOverlay'
import { createFloatingAnchor, type GrFloatingAnchorRect, useFloating, type UseFloatingPlacement } from '../../composables/useFloating'
import { vClickOutside } from '../../directives'
import { useGrComponentSize } from '../GrConfigProvider/context'
import {
  type GrPopoverPadding,
  type GrPopoverRole,
  type GrPopoverSize,
  grPopoverPanelClass,
} from './grPopoverStyles'

export interface GrPopoverProps {
  /**
   * Открыт ли поповер. Без этого пропа компонент ведёт состояние сам
   * (uncontrolled), с ним — слушайте `update:open`.
   */
  open?: boolean
  placement?: UseFloatingPlacement
  /** Зазор между триггером и панелью, px. */
  offsetPx?: number
  size?: GrPopoverSize
  /** Роль панели. Меняется теми, кто строит поверх примитива своё меню/список. */
  role?: GrPopoverRole
  /**
   * Модальный режим: фон уходит в `inert`, Tab ходит по кругу внутри панели,
   * скролл страницы блокируется, а слой встаёт в стек модальным — как окно.
   * Нужен поповеру с формой или подтверждением внутри: без изоляции фона
   * пользователь уводит фокус на страницу, к которой поповер и относится.
   *
   * В этом режиме фокус переносится в панель независимо от `autoFocus`: фон
   * недоступен, и слой без фокуса внутри стал бы клавиатурной ловушкой.
   */
  modal?: boolean
  /** Доступное имя панели. Обязательно для `role="dialog"` без видимого заголовка. */
  ariaLabel?: string
  /** `id` видимого заголовка внутри панели — альтернатива `ariaLabel`. */
  labelledBy?: string
  /**
   * `manual` — открывать только программно (через `v-model:open`). Нужно для
   * контекстного меню и подтверждений, где момент открытия решает потребитель.
   */
  trigger?: 'click' | 'manual'
  closeOnEsc?: boolean
  closeOnClickOutside?: boolean
  /** Закрывать по клику внутри панели — удобно для меню, вредно для формы. */
  closeOnContentClick?: boolean
  /**
   * Переносить фокус на панель при открытии. Именно на панель, а не на первый
   * контрол внутри: сфокусировать поле ввода за пользователя — решение
   * содержимого, а не оболочки.
   */
  autoFocus?: boolean
  /**
   * Точечное переопределение точки монтирования. По умолчанию — общий портал
   * оверлеев (`#gr-portal` либо `portalTarget` из `GrConfigProvider`).
   */
  teleportTo?: string | HTMLElement
  contentClass?: string
  disabled?: boolean
  /**
   * Якорь-прямоугольник в координатах вьюпорта вместо обёртки слота `#trigger`:
   * панель встаёт у точки курсора или у строки списка. Нужен контекстному меню,
   * у которого триггера-элемента нет вовсе.
   *
   * `triggerProps` в этом режиме некому потребить, и своих ARIA-атрибутов
   * поповер никуда не вешает: `aria-haspopup` невалиден вне интерактивного
   * элемента, а `aria-expanded` без хозяина — шум. Связь с содержимым страницы
   * объявляет тот, кто открывает.
   */
  anchor?: GrFloatingAnchorRect | null
  /** Поле панели. `none` — содержимое рисует своё (меню, список опций). */
  padding?: GrPopoverPadding
}

export interface GrPopoverEmits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<GrPopoverProps>(), {
  open: undefined,
  placement: 'bottom-start',
  offsetPx: 8,
  size: undefined,
  role: 'dialog',
  modal: false,
  ariaLabel: undefined,
  labelledBy: undefined,
  trigger: 'click',
  closeOnEsc: true,
  closeOnClickOutside: true,
  closeOnContentClick: false,
  autoFocus: true,
  teleportTo: undefined,
  contentClass: undefined,
  disabled: false,
  anchor: undefined,
  padding: 'default',
})

const emit = defineEmits<GrPopoverEmits>()

const slots = useSlots()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrPopover' })

const { open: isOpen, setOpen } = useControlledOpen(
  () => props.open,
  next => emit('update:open', next),
)

const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const panelId = useId()

const clickOutsideExclude = [() => panelEl.value]

function open(): void {
  if (props.disabled) return
  setOpen(true)
}

function close(): void {
  setOpen(false)
}

function toggle(): void {
  isOpen.value ? close() : open()
}

/**
 * Якорь создаётся один раз и читает координаты геттером: `useFloating`
 * пересоздаёт подписку при смене самой ссылки, а точка меняется на каждый
 * вызов — новый объект рвал бы `autoUpdate` без нужды.
 */
const anchorEl = createFloatingAnchor(() => props.anchor)

/** Обёртка триггера существует только вместе со слотом — см. проп `anchor`. */
const hasTrigger = computed(() => Boolean(slots.trigger))

const { floatingStyle, resolvedPlacement, update: updateFloatingPosition } = useFloating(
  () => (props.anchor ? anchorEl : rootEl.value),
  panelEl,
  isOpen,
  {
    placement: () => props.placement,
    offsetPx: props.offsetPx,
    // Своего слоя у поповера нет намеренно: он и дропдаун — один класс якорных
    // немодальных оверлеев и обязаны лежать на одной высоте, иначе начнут
    // перекрывать друг друга в зависимости от порядка открытия.
    zIndexVar: '--gr-z-dropdown',
  },
)

watch(() => props.placement, () => {
  if (isOpen.value) updateFloatingPosition()
})

// Объект якоря стабилен, поэтому смену координат `useFloating` сам не заметит:
// повторный вызов у другой точки — это пересчёт позиции, а не переоткрытие.
watch(() => props.anchor, () => {
  if (isOpen.value) updateFloatingPosition()
}, { deep: true })

/**
 * Слой стека оверлеев: очередь Esc общая с модалками, поэтому поповер, открытый
 * внутри модалки, по Esc закрывает себя, а не её. Возврат фокуса на триггер
 * тоже отсюда — по правилу «только если на момент закрытия фокус ещё внутри».
 *
 * Модальность включается пропом и приходит той же сборкой, что у окна и drawer'а
 * (`useModalOverlay`): ловушка фокуса, `inert` фона, блокировка скролла. При
 * `modal: false` не включается ничего из этого — дефолтный поповер немодален.
 *
 * Корень слоя и панель здесь один элемент: якорный оверлей уезжает в портал сам,
 * без обёртки.
 */
const { inertAttr, portalTarget, teleportEnabled, themeAttrs } = useModalOverlay(isOpen, close, {
  modal: () => props.modal,
  closeOnEscape: () => props.closeOnEsc,
  panel: panelEl,
  root: panelEl,
  teleportTo: () => props.teleportTo,
  initialFocus: () => panelEl.value,
})

// Фокус переносим после отрисовки панели: до `nextTick` её ещё нет в DOM.
// В модальном режиме перенос обязателен: фон в `inert`, и фокус, оставленный
// снаружи, попал бы в недоступное поддерево.
watch(isOpen, async (next) => {
  if (!next || !(props.autoFocus || props.modal)) return

  await nextTick()
  panelEl.value?.focus()
})

/** Роли, которые `aria-haspopup` действительно понимает. */
const HASPOPUP_ROLES = ['dialog', 'menu', 'listbox', 'grid'] as const

/**
 * Пропсы для реального фокусируемого триггера: `<button v-bind="triggerProps">`.
 * Клик вешается на обёртку, а ARIA — сюда, потому что `aria-expanded` обязан
 * жить на самом интерактивном элементе, а не на `div` вокруг него.
 */
const triggerProps = computed(() => ({
  // `aria-haspopup` принимает не любую роль: `group` в его списке нет, и
  // объявленный им триггер отдавал бы невалидный атрибут, который AT просто
  // отбрасывает. Роли вне списка сообщают о панели только через `aria-expanded`.
  'aria-haspopup': HASPOPUP_ROLES.includes(props.role as (typeof HASPOPUP_ROLES)[number])
    ? (props.role as (typeof HASPOPUP_ROLES)[number])
    : undefined,
  'aria-expanded': isOpen.value,
  'aria-controls': isOpen.value ? panelId : undefined,
  'disabled': props.disabled || undefined,
}))

function onTriggerClick(): void {
  if (props.trigger === 'click') toggle()
}

function onContentClick(): void {
  if (props.closeOnContentClick) close()
}

const panelClasses = computed(() =>
  grPopoverPanelClass(resolvedSize.value, resolvedPlacement.value, props.contentClass, props.padding),
)

defineExpose({ open, close, toggle })
</script>

<template>
  <div data-gr-popover>
    <div
      v-if="hasTrigger"
      ref="rootEl"
      v-click-outside="{ handler: close, enabled: isOpen && closeOnClickOutside, exclude: clickOutsideExclude }"
      data-gr-popover-trigger
      class="inline-block max-w-full"
      @click="onTriggerClick"
    >
      <slot
        name="trigger"
        :open="isOpen"
        :toggle="toggle"
        :close="close"
        :trigger-props="triggerProps"
      />
    </div>

    <teleport :to="portalTarget" :disabled="!teleportEnabled">
      <transition
        enter-active-class="transition ease-[var(--gr-ease-out)] duration-[var(--gr-duration-fast)]"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-[var(--gr-ease-in)] duration-[var(--gr-duration-fast)]"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="isOpen"
          :id="panelId"
          ref="panelEl"
          v-click-outside="{ handler: close, enabled: isOpen && closeOnClickOutside && !hasTrigger }"
          v-bind="themeAttrs"
          data-gr-popover-panel
          data-gr-overlay-root
          :role="role === 'none' ? undefined : role"
          :aria-modal="modal ? 'true' : undefined"
          :inert="inertAttr"
          :aria-label="labelledBy ? undefined : ariaLabel"
          :aria-labelledby="labelledBy"
          tabindex="-1"
          :class="panelClasses"
          :style="floatingStyle"
          @click="onContentClick"
        >
          <slot name="content" :close="close" />
        </div>
      </transition>
    </teleport>
  </div>
</template>
