<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import { usePortalTarget } from '../../composables/usePortalTarget'

import { vClickOutside } from '../../directives'
import { useFloating, type UseFloatingPlacement } from '../../composables/useFloating'
import { useOverlayLayer } from '../../composables/useOverlayLayer'
import { useControlledOpen } from '../../composables/internal/useControlledOpen'
import { useMenuItemsFocus } from '../../composables/internal/useMenuItemsFocus'
import {
  grDropdownContentClass,
  grDropdownOriginClass,
  type GrDropdownWidth,
} from './grDropdownStyles'

export type GrDropdownTrigger = 'click' | 'hover'

export interface GrDropdownProps {
  /** Размещение панели относительно триггера; `flip` при нехватке места остаётся. */
  placement?: UseFloatingPlacement
  /** Зазор между триггером и панелью, px. */
  offset?: number
  /** Ширина панели: число — пиксели, строка — CSS-длина, `auto` — по контенту. */
  width?: GrDropdownWidth
  /** Чем открывается панель. В любом режиме работают клик и клавиатура. */
  trigger?: GrDropdownTrigger
  /** Задержка открытия по наведению, мс. */
  openDelay?: number
  /** Задержка закрытия после ухода курсора, мс. */
  closeDelay?: number
  /** Панель не открывается ничем; триггер остаётся фокусируемым. */
  disabled?: boolean
  /** Закрывать панель по клику внутри content. */
  closeOnContentClick?: boolean
  /** Дополнительные классы контейнера content. */
  contentClass?: string
  /**
   * Точечное переопределение точки монтирования. По умолчанию — общий портал
   * оверлеев (`#gr-portal` либо `portalTarget` из `GrConfigProvider`).
   */
  teleportTo?: string | HTMLElement
  /**
   * Контролируемое состояние панели (`v-model:open`). Без пропа панель ведёт
   * себя сама (uncontrolled), с ним — слушайте `update:open` и меняйте проп.
   */
  open?: boolean
}

export interface GrDropdownEmits {
  /** Панель открылась/закрылась (`v-model:open`). */
  (e: 'update:open', value: boolean): void
}

import { useGrThemeAttrs } from '../GrConfigProvider/context'
import { panelPopTransition } from '../shared/overlayTransition'

const props = withDefaults(defineProps<GrDropdownProps>(), {
  placement: 'bottom-end',
  offset: 8,
  width: '12rem',
  trigger: 'click',
  openDelay: 120,
  closeDelay: 160,
  disabled: false,
  closeOnContentClick: true,
  contentClass: '',
  teleportTo: undefined,
  open: undefined,
})

const emit = defineEmits<GrDropdownEmits>()

// Имя `isOpen` сохранено: читатели работают с computed-Ref.
const { open: isOpen, setOpen } = useControlledOpen(
  () => props.open,
  next => emit('update:open', next),
)

const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const clickOutsideExclude = [() => panelEl.value]

const panelId = useId()

// Кольцо фокуса и поиск по буквам — общие с `GrContextMenu`: паттерн `menu`
// один, и вторая его реализация разошлась бы с первой незаметно для тестов.
const menu = useMenuItemsFocus({
  container: () => panelEl.value,
  close: () => close(),
})

async function openWithFocus(first: boolean): Promise<void> {
  if (props.disabled)
    return

  setOpen(true)
  await nextTick()
  menu.focusAt(first ? 0 : -1)
}

/**
 * Пропсы для реального фокусируемого триггера (кнопки). Консьюмер биндит их на
 * элемент внутри слота `#trigger`: `<GrButton v-bind="triggerProps">`. Даёт
 * `aria-haspopup`/`aria-expanded`/`aria-controls`, клавиатуру и **клик**.
 *
 * Клик живёт здесь, а не на обёртке слота: обёртка ловила бы и клики по
 * вложенным кнопкам и ссылкам, переключая панель мимо намерения пользователя.
 */
const triggerProps = computed(() => ({
  'aria-haspopup': 'menu' as const,
  'aria-expanded': isOpen.value,
  'aria-controls': isOpen.value ? panelId : undefined,
  'aria-disabled': props.disabled ? true : undefined,
  'onClick': toggle,
  'onKeydown': onTriggerKeydown,
}))

function onTriggerKeydown(event: KeyboardEvent): void {
  if (props.disabled)
    return

  switch (event.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
      event.preventDefault()
      void openWithFocus(true)
      break
    case 'ArrowUp':
      event.preventDefault()
      void openWithFocus(false)
      break
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        close()
      }
      break
  }
}

const { floatingStyle, resolvedPlacement, update: updateFloatingPosition } = useFloating(
  rootEl,
  panelEl,
  isOpen,
  {
    placement: () => props.placement,
    // Геттер, а не значение: иначе проп замрёт на моменте `setup`.
    get offsetPx() { return props.offset },
    zIndexVar: '--gr-z-dropdown',
  },
)

// ————— Открытие по наведению. Задержки нужны обе: без `openDelay` панель
// выпрыгивает на любое пересечение курсором, без `closeDelay` её не удержать
// при переходе с триггера на панель — между ними зазор `offset`.
let hoverTimer: ReturnType<typeof setTimeout> | undefined

function open(): void {
  if (props.disabled)
    return

  clearTimeout(hoverTimer)
  setOpen(true)
}

function toggle(): void {
  if (props.disabled)
    return

  clearTimeout(hoverTimer)
  setOpen(!isOpen.value)
}

function close(): void {
  clearTimeout(hoverTimer)
  setOpen(false)
}

function scheduleHover(next: boolean, delayMs: number): void {
  clearTimeout(hoverTimer)

  if (delayMs <= 0) {
    setOpen(next)
    return
  }

  hoverTimer = setTimeout(setOpen, delayMs, next)
}

function onHoverEnter(): void {
  if (props.disabled || props.trigger !== 'hover')
    return
  scheduleHover(true, props.openDelay)
}

function onHoverLeave(): void {
  if (props.trigger !== 'hover')
    return
  scheduleHover(false, props.closeDelay)
}

// Возврат фокуса — из контракта слоя: он запоминает активный элемент при
// открытии и возвращает фокус, только если на момент закрытия тот всё ещё
// внутри панели. Прежняя эвристика «возвращать, если открыли с клавиатуры»
// промахивалась в обе стороны.
useOverlayLayer(isOpen, close, { root: panelEl })

watch(
  () => [props.placement, props.offset],
  () => {
    if (isOpen.value) updateFloatingPosition()
  },
)

watch(
  () => props.disabled,
  (value) => {
    if (value) close()
  },
)

function toCssLength(value: GrDropdownWidth): string | undefined {
  if (value === 'auto')
    return undefined
  if (typeof value === 'number')
    return `${value}px`

  // Строка без единиц браузер просто отбросит, поэтому трактуем её как пиксели
  // — и предупреждаем: `width="48"` легко прочесть как токен шкалы `w-48`.
  const bare = value.trim()
  if (/^\d+$/.test(bare)) {
    if (__GR_DEV__) {
      console.warn(
        `[GrDropdown] width="${value}" трактуется как ${bare}px. `
        + 'Шкалы tailwind-токенов (w-48) у пропа больше нет — укажите единицы: '
        + `width="${bare}px" или :width="${bare}".`,
      )
    }
    return `${bare}px`
  }

  return value
}

const panelStyle = computed(() => {
  const width = toCssLength(props.width)
  return width ? { ...floatingStyle.value, width } : floatingStyle.value
})

const contentClasses = computed(() => grDropdownContentClass(props.contentClass))

const panelClasses = computed(() => grDropdownOriginClass(resolvedPlacement.value))

function onContentClick(): void {
  if (props.closeOnContentClick) {
    close()
  }
}

// Триггер без `v-bind="triggerProps"` — это триггер без клика, без клавиатуры и
// без ARIA. Молчать об этом нельзя: панель просто не открывалась бы, и искать
// причину пришлось бы в чужом коде.
onMounted(() => {
  if (!__GR_DEV__)
    return
  if (rootEl.value?.querySelector('[aria-haspopup]'))
    return

  console.warn(
    '[GrDropdown] триггер не привязан: добавьте `v-bind="triggerProps"` на элемент '
    + 'внутри слота #trigger — <template #trigger="{ triggerProps }">'
    + '<GrButton v-bind="triggerProps">…</GrButton></template>. '
    + 'Без этого у триггера нет ни клика, ни клавиатуры, ни aria-haspopup/aria-expanded.',
  )
})

onBeforeUnmount(() => {
  menu.reset()
  clearTimeout(hoverTimer)
})

// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
// рендер не совпадает с серверным и ломается гидрация (см. композабл).
const { target: portalTarget, enabled: teleportEnabled } = usePortalTarget(() => props.teleportTo)

// Тема поддерева на телепортированную панель: в DOM она уезжает в `body`, то
// есть вне обёртки провайдера, и `data-theme` с неё не наследуется. В дереве
// компонентов панель остаётся внутри — `inject` доходит, и тему она ставит себе
// сама.
const themeAttrs = useGrThemeAttrs()

defineExpose({ open, close, toggle })

defineSlots<{
  /**
   * Триггер панели. `triggerProps` обязаны попасть на сам интерактивный
   * элемент, а не на обёртку вокруг него: `aria-expanded` и `aria-controls`
   * читаются с того узла, который получает фокус.
   */
  trigger?: (props: {
    open: boolean
    toggle: () => void
    close: () => void
    triggerProps: Record<string, unknown>
  }) => any
  /** Содержимое меню. */
  content?: (props: { close: () => void }) => any
}>()

</script>

<template>
  <div data-gr-dropdown>
    <div
      ref="rootEl"
      v-click-outside="{ handler: close, enabled: isOpen, exclude: clickOutsideExclude }"
      data-gr-dropdown-trigger
      class="inline-block max-w-full"
      @mouseenter="onHoverEnter"
      @mouseleave="onHoverLeave"
    >
      <slot name="trigger" :open="isOpen" :toggle="toggle" :close="close" :trigger-props="triggerProps" />
    </div>

    <teleport :to="portalTarget" :disabled="!teleportEnabled">
      <transition
        :enter-active-class="panelPopTransition.enter"
        :enter-from-class="panelPopTransition.enterFrom"
        :enter-to-class="panelPopTransition.enterTo"
        :leave-active-class="panelPopTransition.leave"
        :leave-from-class="panelPopTransition.leaveFrom"
        :leave-to-class="panelPopTransition.leaveTo"
      >
        <div
          v-show="isOpen"
          :id="panelId"
          ref="panelEl"
          v-bind="themeAttrs"
          data-gr-dropdown-panel
          data-gr-overlay-root
          role="menu"
          tabindex="-1"
          :class="panelClasses"
          :style="panelStyle"
          @click="onContentClick"
          @keydown="menu.onKeydown"
          @mouseenter="onHoverEnter"
          @mouseleave="onHoverLeave"
        >
          <div data-gr-dropdown-content :class="contentClasses">
            <slot name="content" :close="close" />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
