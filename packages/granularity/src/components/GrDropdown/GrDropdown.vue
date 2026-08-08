<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import { usePortalTarget } from '../../composables/usePortalTarget'

import { vClickOutside } from '../../directives'
import { useFloating, type UseFloatingPlacement } from '../../composables/useFloating'
import { useOverlayLayer } from '../../composables/useOverlayLayer'
import { useControlledOpen } from '../../composables/internal/useControlledOpen'
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

// Фокусируемые пункты панели для клавиатурной навигации (roving-фокус).
function panelItems(): HTMLElement[] {
  const root = panelEl.value
  if (!root)
    return []
  const selector = '[role="menuitem"], a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(el => el.offsetParent !== null || el === document.activeElement)
}

function focusItemAt(index: number): void {
  const items = panelItems()
  if (items.length === 0)
    return
  const clamped = (index + items.length) % items.length
  items[clamped]?.focus()
}

async function openWithFocus(first: boolean): Promise<void> {
  if (props.disabled)
    return

  setOpen(true)
  await nextTick()
  focusItemAt(first ? 0 : -1)
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

/**
 * Typeahead паттерна menu: печатные символы копятся в буфер и переводят фокус
 * на первый подходящий пункт, начиная со следующего за текущим.
 */
const TYPEAHEAD_RESET_MS = 600
let typeaheadBuffer = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

function onTypeahead(char: string): void {
  clearTimeout(typeaheadTimer)
  typeaheadTimer = setTimeout(() => { typeaheadBuffer = '' }, TYPEAHEAD_RESET_MS)

  // Повтор одной буквы — это «следующий на ту же букву», а не поиск «аа».
  const repeat = typeaheadBuffer.length === 1 && typeaheadBuffer === char
  typeaheadBuffer = repeat ? char : typeaheadBuffer + char

  const query = typeaheadBuffer.toLowerCase()
  const items = panelItems()
  if (items.length === 0)
    return

  const currentIndex = items.indexOf(document.activeElement as HTMLElement)

  for (let step = 1; step <= items.length; step += 1) {
    const item = items[(currentIndex + step + items.length) % items.length]
    if ((item.textContent ?? '').trim().toLowerCase().startsWith(query)) {
      item.focus()
      return
    }
  }
}

function onPanelKeydown(event: KeyboardEvent): void {
  const items = panelItems()
  const currentIndex = items.indexOf(document.activeElement as HTMLElement)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusItemAt(currentIndex + 1)
      return
    case 'ArrowUp':
      event.preventDefault()
      focusItemAt(currentIndex - 1)
      return
    case 'Home':
      event.preventDefault()
      focusItemAt(0)
      return
    case 'End':
      event.preventDefault()
      focusItemAt(-1)
      return
    case 'Tab':
      close()
      return
  }

  // Печатный символ без модификаторов — поиск по пунктам, а не команда.
  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault()
    onTypeahead(event.key)
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
    if (process.env.NODE_ENV !== 'production') {
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
  if (process.env.NODE_ENV === 'production')
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
  clearTimeout(typeaheadTimer)
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
          data-gr-dropdown-panel
          data-gr-overlay-root
          role="menu"
          tabindex="-1"
          :class="panelClasses"
          :style="panelStyle"
          @click="onContentClick"
          @keydown="onPanelKeydown"
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
