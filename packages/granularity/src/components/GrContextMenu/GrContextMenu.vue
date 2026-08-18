<script setup lang="ts">
/**
 * GrContextMenu — меню по правому клику.
 *
 * Отличие от `GrDropdownMenu` не в содержимом, а в том, откуда меню растёт: у
 * дропдауна есть триггер-элемент, здесь — точка курсора, которой в DOM нет.
 * Поэтому слой берётся у `GrPopover` в якорном режиме, а не собирается заново.
 *
 * A11y: панель — `role="menu"` с доступным именем, пункты приезжают из
 * `GrDropdownMenu` вместе со своими ролями. Меню, открываемое только правым
 * кликом, недоступно с клавиатуры, поэтому обёртка ловит `Shift+F10` и клавишу
 * `ContextMenu` — это условие приёмки, а не удобство.
 */
import { computed, nextTick, onBeforeUnmount, ref, useSlots, watch } from 'vue'

import { useControlledOpen } from '../../composables/internal/useControlledOpen'
import { useMenuItemsFocus } from '../../composables/internal/useMenuItemsFocus'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { isEditableTarget } from '../../internal/keyboard'
import GrDropdownMenuEntries from '../GrDropdownMenu/GrDropdownMenuEntries.vue'
import GrDropdownMenuList from '../GrDropdownMenu/GrDropdownMenuList.vue'
import type { GrDropdownMenuAction, GrDropdownMenuEntry } from '../GrDropdownMenu/menuModel'
import { isMenuAction, isMenuSection } from '../GrDropdownMenu/menuModel'
import GrPopover from '../GrPopover/GrPopover.vue'
import type { GrFloatingAnchorRect, UseFloatingPlacement } from '../../composables/useFloating'

import {
  anchorFromElement,
  anchorFromPointer,
  isContextMenuKey,
  isKeyboardContextMenu,
  wantsNativeMenu,
} from './contextMenuAnchor'

/** Чем открывается меню. `manual` — только императивно, из кода потребителя. */
export type GrContextMenuTrigger = 'contextmenu' | 'manual'

/** Откуда пришло открытие: указатель, клавиатура или вызов из кода. */
export type GrContextMenuSource = 'pointer' | 'keyboard' | 'api'

export interface GrContextMenuOpenContext {
  source: GrContextMenuSource
  /** По чему кликнули или что было в фокусе — отсюда потребитель берёт строку. */
  target: HTMLElement | null
  anchor: GrFloatingAnchorRect
  event: MouseEvent | KeyboardEvent | null
}

export interface GrContextMenuProps {
  /** Декларативное меню. Слот `#content` сильнее. */
  items?: GrDropdownMenuEntry[]
  /** Открыто ли меню. Без пропа компонент ведёт состояние сам. */
  open?: boolean
  trigger?: GrContextMenuTrigger
  disabled?: boolean
  placement?: UseFloatingPlacement
  /** Зазор от якоря. Ноль по умолчанию: меню липнет к курсору. */
  offsetPx?: number
  /** Меню из коротких слов не должно быть шириной в слово. */
  minWidth?: number | string
  ariaLabel?: string
  labelledBy?: string
  teleportTo?: string | HTMLElement
  contentClass?: string
  listClass?: string
  dividers?: boolean
  /**
   * Закрывать при прокрутке страницы. Якорь — точка вьюпорта, и панель осталась
   * бы висеть на экране, пока контент под ней уезжает. Так же ведут себя
   * нативные меню.
   */
  closeOnScroll?: boolean
  /** Пропускать `Shift`+правый клик к браузеру. */
  allowNativeMenu?: boolean
}

export interface GrContextMenuEmits {
  (e: 'update:open', value: boolean): void
  /**
   * Меню собирается открыться у этой цели. Приходит **до** открытия, чтобы
   * потребитель успел пересобрать `items` под неё: пункты для папки и для файла
   * разные, а узнать цель иначе неоткуда. Пустая модель после этого просто не
   * откроется — отдельный способ отменить открытие не нужен.
   */
  (e: 'beforeOpen', context: GrContextMenuOpenContext): void
  (e: 'select', item: GrDropdownMenuAction): void
}

const props = withDefaults(defineProps<GrContextMenuProps>(), {
  items: undefined,
  open: undefined,
  trigger: 'contextmenu',
  disabled: false,
  placement: 'bottom-start',
  offsetPx: 0,
  minWidth: '11rem',
  ariaLabel: undefined,
  labelledBy: undefined,
  teleportTo: undefined,
  contentClass: undefined,
  listClass: undefined,
  dividers: false,
  closeOnScroll: true,
  allowNativeMenu: true,
})

const emit = defineEmits<GrContextMenuEmits>()

const slots = useSlots()
const { t } = useGranularityTranslations()

const { open: isOpen, setOpen } = useControlledOpen(
  () => props.open,
  next => emit('update:open', next),
)

const areaEl = ref<HTMLElement | null>(null)
const listRef = ref<{ $el?: HTMLElement } | null>(null)
const anchor = ref<GrFloatingAnchorRect | null>(null)

const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.contextMenu.label', 'Context menu'))

const listStyle = computed(() => ({
  minWidth: typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth,
}))

/**
 * Меню без единого действия не открывается: фокусировать в нём нечего, и оно
 * становится ловушкой, из которой есть только Esc.
 */
const isEmpty = computed(() => {
  if (slots.content)
    return false

  return (props.items ?? []).every(entry => !isMenuAction(entry)
    && (!isMenuSection(entry) || entry.items.length === 0))
})

const menu = useMenuItemsFocus({
  container: () => listRef.value?.$el ?? null,
  close: () => close(),
})

function panelOf(): HTMLElement | null {
  return listRef.value?.$el?.closest('[data-gr-popover-panel]') ?? null
}

function isInsidePanel(target: EventTarget | null): boolean {
  return target instanceof Node && (panelOf()?.contains(target) ?? false)
}

async function openWith(context: GrContextMenuOpenContext): Promise<void> {
  if (props.disabled)
    return

  anchor.value = context.anchor
  emit('beforeOpen', context)

  // Тик между уведомлением и открытием — не перестраховка: `items` доезжают сюда
  // пропом, то есть следующим рендером родителя. Без ожидания меню под узел
  // дерева открылось бы с пунктами от предыдущей цели.
  await nextTick()

  if (isEmpty.value)
    return

  setOpen(true)

  await nextTick()
  menu.focusAt(0)
}

/** Открыть у точки курсора или у произвольного прямоугольника вьюпорта. */
function openAt(at: MouseEvent | GrFloatingAnchorRect): void {
  const fromPointer = at instanceof MouseEvent

  void openWith({
    source: fromPointer ? 'pointer' : 'api',
    target: fromPointer ? (at.target as HTMLElement | null) : null,
    anchor: fromPointer ? anchorFromPointer(at) : at,
    event: fromPointer ? at : null,
  })
}

/** Открыть у прямоугольника элемента — клавиатурный путь для внешних композитов. */
function openAtElement(element: Element): void {
  void openWith({
    source: 'api',
    target: element instanceof HTMLElement ? element : null,
    anchor: anchorFromElement(element),
    event: null,
  })
}

function open(): void {
  if (anchor.value)
    void openWith({ source: 'api', target: null, anchor: anchor.value, event: null })
  else if (areaEl.value)
    openAtElement(areaEl.value)
}

function close(): void {
  setOpen(false)
  menu.reset()
}

function toggle(): void {
  isOpen.value ? close() : open()
}

function onSelect(item: GrDropdownMenuAction): void {
  emit('select', item)
}

function onAreaContextMenu(event: MouseEvent): void {
  if (props.trigger !== 'contextmenu' || props.disabled)
    return

  if (props.allowNativeMenu && wantsNativeMenu(event))
    return

  event.preventDefault()
  // Вложенные области: побеждает ближайшая к цели, как в нативных приложениях.
  event.stopPropagation()

  if (isKeyboardContextMenu(event)) {
    const target = (document.activeElement as HTMLElement | null) ?? areaEl.value
    if (target) openAtElement(target)
    return
  }

  openAt(event)
}

/**
 * `trigger` здесь намеренно не проверяется: `manual` отключает открытие
 * указателем, а клавиатурный путь оставить обязан — иначе меню недоступно с
 * клавиатуры в принципе, и потребителю пришлось бы писать этот обработчик
 * заново на каждой странице.
 */
function onAreaKeydown(event: KeyboardEvent): void {
  if (props.disabled)
    return

  if (!isContextMenuKey(event))
    return

  // В поле ввода нативное меню (орфография, буфер) полезнее нашего.
  if (isEditableTarget(event.target))
    return

  // Отмена keydown гасит `contextmenu`, который браузер породил бы следом:
  // без неё меню открылось бы дважды и второй раз — по координатам, а не по
  // прямоугольнику строки.
  event.preventDefault()

  const target = (document.activeElement as HTMLElement | null) ?? areaEl.value
  if (!target)
    return

  void openWith({
    source: 'keyboard',
    target,
    anchor: anchorFromElement(target),
    event,
  })
}

/**
 * Правый клик мимо меню его не закрывает: `v-click-outside` отбрасывает всё,
 * что не левая кнопка, а `contextmenu` вообще не порождает `click`. Ослаблять
 * директиву нельзя — гард бережёт дропдауны, — поэтому слушаем сами.
 */
function onDocumentContextMenu(event: MouseEvent): void {
  if (isInsidePanel(event.target)) {
    event.preventDefault()
    return
  }

  // Внутри своей области меню не закрываем: обработчик области перенесёт его к
  // новой точке, а закрытие с последующим открытием мигало бы панелью.
  if (event.target instanceof Node && areaEl.value?.contains(event.target))
    return

  close()
}

function onDocumentScroll(event: Event): void {
  if (isInsidePanel(event.target))
    return

  close()
}

let scrollFrame: number | undefined

function stopListening(): void {
  if (scrollFrame !== undefined) {
    cancelAnimationFrame(scrollFrame)
    scrollFrame = undefined
  }

  window.removeEventListener('contextmenu', onDocumentContextMenu, true)
  window.removeEventListener('scroll', onDocumentScroll, true)
}

watch(isOpen, (next) => {
  if (typeof window === 'undefined')
    return

  if (!next) {
    stopListening()
    return
  }

  window.addEventListener('contextmenu', onDocumentContextMenu, true)

  // Слушатель прокрутки — со следующего кадра: само открытие прокручивает
  // страницу (браузер подтягивает в вид то, по чему кликнули и что получило
  // фокус), и меню закрывало бы само себя ровно в момент появления.
  if (props.closeOnScroll) {
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = undefined
      window.addEventListener('scroll', onDocumentScroll, { capture: true, passive: true })
    })
  }
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined')
    return

  stopListening()
})

defineExpose({ openAt, openAtElement, open, close, toggle })
</script>

<template>
  <div data-gr-context-menu>
    <div
      v-if="slots.default"
      ref="areaEl"
      data-gr-context-menu-area
      @contextmenu="onAreaContextMenu"
      @keydown="onAreaKeydown"
    >
      <slot :open="isOpen" />
    </div>

    <GrPopover
      :open="isOpen"
      :anchor="anchor"
      :placement="placement"
      :offset-px="offsetPx"
      :teleport-to="teleportTo"
      :content-class="contentClass"
      :aria-label="labelledBy ? undefined : resolvedAriaLabel"
      :labelled-by="labelledBy"
      role="menu"
      trigger="manual"
      padding="none"
      close-on-content-click
      :auto-focus="false"
      @update:open="setOpen($event)"
    >
      <template #content="{ close: closePanel }">
        <GrDropdownMenuList
          ref="listRef"
          class="p-1"
          :style="listStyle"
          :dividers="dividers"
          :class="listClass"
          @keydown="menu.onKeydown"
        >
          <slot name="content" :close="closePanel">
            <GrDropdownMenuEntries :items="items" @select="onSelect" />
          </slot>
        </GrDropdownMenuList>
      </template>
    </GrPopover>
  </div>
</template>
