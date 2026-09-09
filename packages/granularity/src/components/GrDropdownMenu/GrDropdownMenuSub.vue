<script setup lang="ts">
/**
 * Пункт, раскрывающий подменю.
 *
 * Панель второго уровня — тот же `GrPopover`, что и у первого: слой, портал,
 * позиционирование с переворотом и очередь Esc уже там, и вторая их сборка
 * разошлась бы с первой молча. Своё здесь только то, чем подменю отличается от
 * меню: коридор для курсора, `ArrowRight`/`ArrowLeft` и связь с цепочкой —
 * уровни лежат в портале братьями, и родства между ними в DOM нет.
 */
import { computed, inject, nextTick, provide, ref, useId, watch } from 'vue'
import type { Component } from 'vue'

import IconChevronRight from '~icons/lucide/chevron-right'

import { useMenuItemsFocus } from '../../composables/internal/useMenuItemsFocus'
import { useSubmenuHover } from '../../composables/internal/useSubmenuHover'
import GrPopover from '../GrPopover/GrPopover.vue'
import type { UseFloatingPlacement } from '../../composables/useFloating'

import GrDropdownMenuItem from './GrDropdownMenuItem.vue'
import GrDropdownMenuList from './GrDropdownMenuList.vue'
import { subIndicatorClass, type GrDropdownMenuItemAlign, type GrDropdownMenuItemVariant } from './grDropdownMenuStyles'
import { GR_MENU_CHAIN_KEY } from './menuChain'

export interface GrDropdownMenuSubProps {
  /** Подпись пункта. Слот `#label` сильнее. */
  label?: string
  /** Иконка слева. Слот `#icon` сильнее. */
  icon?: Component
  /** Пункт не раскрывается ничем; из таб-порядка не выпадает. */
  disabled?: boolean
  variant?: GrDropdownMenuItemVariant
  align?: GrDropdownMenuItemAlign
  /** Размещение панели подменю; переворот при нехватке места остаётся. */
  placement?: UseFloatingPlacement
  /** Зазор между пунктом и панелью, px. */
  offset?: number
  /** Меню из коротких слов не должно быть шириной в слово. */
  minWidth?: number | string
  /** Задержка раскрытия по наведению, мс. */
  openDelay?: number
  /** Задержка закрытия после ухода курсора, мс. */
  closeDelay?: number
  /** Разделители между пунктами подменю. */
  dividers?: boolean
  contentClass?: string
  listClass?: string
}

const props = withDefaults(defineProps<GrDropdownMenuSubProps>(), {
  label: undefined,
  icon: undefined,
  disabled: false,
  variant: 'default',
  align: 'left',
  placement: 'right-start',
  offset: 0,
  minWidth: '11rem',
  openDelay: 100,
  closeDelay: 160,
  dividers: false,
  contentClass: undefined,
  listClass: undefined,
})

const isOpen = ref(false)
const triggerId = useId()
const listRef = ref<{ $el?: HTMLElement } | null>(null)
const triggerRef = ref<{ $el?: HTMLElement } | null>(null)

/**
 * Ключ этого подменю в реестре уровня. `Symbol`, а не индекс: соседей никто не
 * нумерует, а сравнивать нужно именно «моё раскрыто или чужое».
 */
const key = Symbol('gr-dropdown-menu-sub')

// Вне меню компонент остаётся рабочим — как `GrSidebarItem` вне панели.
const parent = inject(GR_MENU_CHAIN_KEY, null)

function triggerEl(): HTMLElement | null {
  return triggerRef.value?.$el ?? null
}

function panelEl(): HTMLElement | null {
  return listRef.value?.$el?.closest('[data-gr-popover-panel]') ?? null
}

function closeRoot(): void {
  if (parent)
    parent.closeRoot()
  else close()
}

const closeOnSelect = (): boolean => parent?.closeOnSelect() ?? true

const menu = useMenuItemsFocus({
  container: () => listRef.value?.$el ?? null,
  // `Tab` из подменю уводит фокус со всего меню, а не на уровень выше.
  close: closeRoot,
})

/**
 * Реестр раскрытых подменю **этого** уровня: его читают дети, а он сам —
 * наведение, чтобы не закрыться, пока курсор ушёл на уровень ниже.
 */
const childActive = ref<symbol | null>(null)

const hover = useSubmenuHover({
  panel: panelEl,
  isOpen: () => isOpen.value,
  open,
  close,
  openDelay: () => props.openDelay,
  closeDelay: () => props.closeDelay,
  travelling: parent?.travelling,
  blocked: () => childActive.value !== null,
})

watch(childActive, (active) => {
  if (active === null)
    hover.settle()
})

function open(): void {
  if (props.disabled)
    return

  isOpen.value = true
  if (parent)
    parent.active.value = key
}

function close(): void {
  isOpen.value = false
  hover.stop()
  menu.reset()
  if (parent && parent.active.value === key)
    parent.active.value = null
}

async function openWithFocus(): Promise<void> {
  if (props.disabled)
    return

  open()
  await nextTick()
  menu.focusAt(0)
}

function closeWithFocus(): void {
  close()
  triggerEl()?.focus({ preventScroll: true })
}

// Раскрылось соседнее подменю — это моё закрытие: `mouseleave` бывает не
// всегда, стрелками фокус уходит на соседа без единого события мыши.
watch(() => parent?.active.value, (active) => {
  if (isOpen.value && active !== key)
    close()
})

// Закрылась панель уровнем выше — своя обязана уйти вместе с ней.
watch(() => parent?.open.value ?? true, (parentOpen) => {
  if (!parentOpen)
    close()
})

provide(GR_MENU_CHAIN_KEY, {
  closeRoot,
  closeOnSelect,
  level: (parent?.level ?? 0) + 1,
  open: isOpen,
  active: childActive,
  travelling: ref(false),
})

/**
 * Клик по раскрывателю не всплывает до панели родителя намеренно: там он
 * означал бы выбор, и `closeOnContentClick` закрыл бы меню ровно в тот момент,
 * когда пользователь раскрыл его следующий уровень.
 */
function onTriggerClick(event: MouseEvent): void {
  event.stopPropagation()

  if (isOpen.value)
    close()
  else void openWithFocus()
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if (props.disabled)
    return

  switch (event.key) {
    case 'ArrowRight':
    case 'Enter':
    case ' ':
      // Отмена обязательна и для `Enter`, и для пробела: без неё кнопка родит
      // следом `click`, а он у меню означает выбор и закрывает цепочку.
      event.preventDefault()
      event.stopPropagation()
      void openWithFocus()
      break
  }
}

function onPanelKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    event.stopPropagation()
    closeWithFocus()
    return
  }

  // Телепорт уносит панель из поддерева родителя, но всплытие гасим всё равно:
  // с выключенным порталом (SSR-стенд, тесты) стрелки дошли бы до кольца
  // родителя и увели фокус из подменю.
  if (menu.onKeydown(event))
    event.stopPropagation()
}

function onPanelClick(): void {
  if (closeOnSelect())
    closeRoot()
}

const listStyle = computed(() => ({
  minWidth: typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth,
}))

/**
 * Потолок ширины панели снят по той же причине, что у `GrContextMenu`: свой
 * `minWidth` лежит на списке внутри панели, а панель содержимое не обрезает —
 * два предела на одну ширину спорили бы друг с другом.
 */
const panelClass = computed(() => ['[--gr-popover-max-width:100vw]', props.contentClass].filter(Boolean).join(' '))

defineExpose({ open, close })

defineSlots<{
  /** Пункты подменю. */
  default?: () => any
  /** Подпись пункта вместо пропа `label`. */
  label?: () => any
  /** Иконка перед подписью. */
  icon?: () => any
}>()
</script>

<template>
  <GrPopover
    role="menu"
    padding="none"
    trigger="manual"
    block
    :open="isOpen"
    :placement="placement"
    :offset-px="offset"
    :labelled-by="triggerId"
    :content-class="panelClass"
    :auto-focus="false"
    @update:open="$event ? open() : close()"
  >
    <template #trigger="{ triggerProps }">
      <GrDropdownMenuItem
        :id="triggerId"
        ref="triggerRef"
        data-gr-dropdown-menu-sub-trigger
        :aria-haspopup="triggerProps['aria-haspopup']"
        :aria-expanded="triggerProps['aria-expanded']"
        :aria-controls="triggerProps['aria-controls']"
        :disabled="disabled"
        :variant="variant"
        :align="align"
        :icon="icon"
        :expanded="isOpen"
        @click="onTriggerClick"
        @keydown="onTriggerKeydown"
        @mouseenter="hover.onTriggerEnter"
        @mouseleave="hover.onTriggerLeave"
      >
        <template v-if="$slots.icon" #icon>
          <slot name="icon" />
        </template>

        <slot name="label">
{{ label }}
</slot>

        <template #shortcut>
          <IconChevronRight :class="subIndicatorClass" aria-hidden="true" />
        </template>
      </GrDropdownMenuItem>
    </template>

    <template #content>
      <GrDropdownMenuList
        ref="listRef"
        class="p-1"
        :style="listStyle"
        :dividers="dividers"
        :class="listClass"
        @keydown="onPanelKeydown"
        @click="onPanelClick"
        @mouseenter="hover.onPanelEnter"
        @mouseleave="hover.onPanelLeave"
      >
        <slot />
      </GrDropdownMenuList>
    </template>
  </GrPopover>
</template>
