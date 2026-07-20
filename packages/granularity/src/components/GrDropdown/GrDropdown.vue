<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

import { vClickOutside } from '../../directives'
import { useFloating } from '../../composables/internal/useFloating'
import { useEscapeToClose } from '../../composables/internal/useEscapeToClose'
import {
  grDropdownContentClass,
  grDropdownOriginClass,
  grDropdownWidthClass,
  type GrDropdownAlign,
  type GrDropdownWidth,
} from './grDropdownStyles'

export interface GrDropdownProps {
  /** Выравнивание панели относительно триггера. */
  align?: GrDropdownAlign
  /** Ширина панели (tailwind-токены `w-*` или `auto`). */
  width?: GrDropdownWidth
  /** Закрывать панель по клику внутри content. */
  closeOnContentClick?: boolean
  /** Дополнительные классы контейнера content. */
  contentClass?: string
  /** Куда телепортировать панель (`body` по умолчанию). */
  teleportTo?: string | HTMLElement
}

const props = withDefaults(defineProps<GrDropdownProps>(), {
  align: 'right',
  width: '48',
  closeOnContentClick: true,
  contentClass: '',
  teleportTo: 'body',
})

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const clickOutsideExclude = [() => panelEl.value]

const panelId = useId()

// Элемент триггера, которому вернём фокус при закрытии (клавиатурный сценарий).
let triggerFocusEl: HTMLElement | null = null

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
  triggerFocusEl = (document.activeElement as HTMLElement) ?? null
  open.value = true
  await nextTick()
  focusItemAt(first ? 0 : -1)
}

function returnFocusToTrigger(): void {
  const target = triggerFocusEl
  triggerFocusEl = null
  target?.focus?.()
}

/**
 * Пропсы для реального фокусируемого триггера (кнопки). Консьюмер биндит их на
 * элемент внутри слота `#trigger`: `<button v-bind="triggerProps">`. Даёт
 * `aria-haspopup`/`aria-expanded`/`aria-controls` и клавиатуру (Enter/Space/стрелки).
 */
const triggerProps = computed(() => ({
  'aria-haspopup': 'menu' as const,
  'aria-expanded': open.value,
  'aria-controls': open.value ? panelId : undefined,
  'onKeydown': onTriggerKeydown,
}))

function onTriggerKeydown(event: KeyboardEvent): void {
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
      if (open.value) {
        event.preventDefault()
        close()
      }
      break
  }
}

function onPanelKeydown(event: KeyboardEvent): void {
  const items = panelItems()
  const currentIndex = items.indexOf(document.activeElement as HTMLElement)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusItemAt(currentIndex + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusItemAt(currentIndex - 1)
      break
    case 'Home':
      event.preventDefault()
      focusItemAt(0)
      break
    case 'End':
      event.preventDefault()
      focusItemAt(-1)
      break
    case 'Tab':
      close()
      break
  }
}

// `align='right'` — правый край панели совпадает с правым краем триггера (bottom-end);
// `align='left'` — левые края (bottom-start); `align='center'` — floating-ui сам
// центрирует панель под триггером при обычном `'bottom'` без суффикса.
const placementByAlign: Record<GrDropdownAlign, 'bottom-start' | 'bottom-end' | 'bottom'> = {
  left: 'bottom-start',
  right: 'bottom-end',
  center: 'bottom',
}

const { floatingStyle, resolvedPlacement, update: updateFloatingPosition } = useFloating(
  rootEl,
  panelEl,
  open,
  {
    placement: () => placementByAlign[props.align],
    zIndexVar: '--gr-z-dropdown',
  },
)

function toggle(): void {
  open.value = !open.value
}

function close(): void {
  const wasOpen = open.value
  open.value = false
  // Возвращаем фокус на триггер только если панель была открыта с клавиатуры.
  if (wasOpen)
    returnFocusToTrigger()
}

useEscapeToClose(open, close)

watch(
  () => props.align,
  () => {
    if (open.value) updateFloatingPosition()
  },
)

const widthClass = computed(() => grDropdownWidthClass(props.width))

const contentClasses = computed(() => grDropdownContentClass(props.contentClass))

const panelClasses = computed(() => {
  return [widthClass.value, grDropdownOriginClass(resolvedPlacement.value)].filter(Boolean)
})

function onContentClick(): void {
  if (props.closeOnContentClick) {
    close()
  }
}
</script>

<template>
  <div data-gr-dropdown>
    <div
      ref="rootEl"
      v-click-outside="{ handler: close, enabled: open, exclude: clickOutsideExclude }"
      data-gr-dropdown-trigger
      class="inline-block max-w-full"
      @click="toggle"
    >
      <slot name="trigger" :open="open" :toggle="toggle" :close="close" :triggerProps="triggerProps" />
    </div>

    <teleport :to="teleportTo">
      <transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="open"
          :id="panelId"
          ref="panelEl"
          data-gr-dropdown-panel
          role="menu"
          tabindex="-1"
          :class="panelClasses"
          :style="floatingStyle"
          @click="onContentClick"
          @keydown="onPanelKeydown"
        >
          <div data-gr-dropdown-content :class="contentClasses">
            <slot name="content" :close="close" />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
