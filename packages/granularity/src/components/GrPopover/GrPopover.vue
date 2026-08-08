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
 * - **фокус-ловушки нет намеренно**: Tab обязан уводить фокус наружу, иначе
 *   немодальный слой запирает пользователя на странице, которая не заблокирована.
 */
import { computed, nextTick, ref, useId, watch } from 'vue'

import { usePortalTarget } from '../../composables/usePortalTarget'
import { useControlledOpen } from '../../composables/internal/useControlledOpen'
import { useFloating, type UseFloatingPlacement } from '../../composables/useFloating'
import { useOverlayLayer } from '../../composables/useOverlayLayer'
import { vClickOutside } from '../../directives'
import { useGrComponentSize, useGrThemeAttrs } from '../GrConfigProvider/context'
import {
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
})

const emit = defineEmits<GrPopoverEmits>()

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

const { floatingStyle, resolvedPlacement, update: updateFloatingPosition } = useFloating(
  rootEl,
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

/**
 * Слой стека оверлеев: очередь Esc общая с модалками, поэтому поповер, открытый
 * внутри модалки, по Esc закрывает себя, а не её. Возврат фокуса на триггер
 * тоже отсюда — по правилу «только если на момент закрытия фокус ещё внутри».
 */
useOverlayLayer(isOpen, close, {
  modal: false,
  closeOnEscape: () => props.closeOnEsc,
  root: panelEl,
})

// Фокус переносим после отрисовки панели: до `nextTick` её ещё нет в DOM.
watch(isOpen, async (next) => {
  if (!next || !props.autoFocus) return

  await nextTick()
  panelEl.value?.focus()
})

/**
 * Пропсы для реального фокусируемого триггера: `<button v-bind="triggerProps">`.
 * Клик вешается на обёртку, а ARIA — сюда, потому что `aria-expanded` обязан
 * жить на самом интерактивном элементе, а не на `div` вокруг него.
 */
const triggerProps = computed(() => ({
  'aria-haspopup': props.role === 'none' ? undefined : props.role,
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
  grPopoverPanelClass(resolvedSize.value, resolvedPlacement.value, props.contentClass),
)

// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский рендер
// не совпадёт с серверным и сломается гидрация (см. композабл).
const { target: portalTarget, enabled: teleportEnabled } = usePortalTarget(() => props.teleportTo)

// Тема поддерева на телепортированную панель: в DOM она уезжает в `body`, то
// есть вне обёртки провайдера, и `data-theme` с неё не наследуется. В дереве
// компонентов панель остаётся внутри — `inject` доходит, и тему она ставит себе
// сама.
const themeAttrs = useGrThemeAttrs()

defineExpose({ open, close, toggle })
</script>

<template>
  <div data-gr-popover>
    <div
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
        enter-active-class="transition ease-out duration-150"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="isOpen"
          :id="panelId"
          ref="panelEl"
          v-bind="themeAttrs"
          data-gr-popover-panel
          data-gr-overlay-root
          :role="role === 'none' ? undefined : role"
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
