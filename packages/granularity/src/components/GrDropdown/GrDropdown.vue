<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import type { UseFloatingPlacement } from '../../composables/useFloating'
import { useControlledOpen } from '../../composables/internal/useControlledOpen'
import { useMenuItemsFocus } from '../../composables/internal/useMenuItemsFocus'
import GrPopover from '../GrPopover/GrPopover.vue'
import {
  grDropdownContentClass,
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

/**
 * Меню поверх `GrPopover`.
 *
 * Панель, слой, портал, позиционирование, наведение с задержками и возврат
 * фокуса принадлежат примитиву. До этого здесь жила вторая их реализация:
 * карта `transform-origin` совпадала с поповерской дословно все двенадцать
 * записей, поверхность панели — шесть утилит — была скопирована, а сборка слоя
 * и портала повторяла его же. Расходились бы молча.
 *
 * Меню оставляет себе то, что меню и есть: кольцо фокуса по пунктам, поиск по
 * буквам, клавиатуру открытия и ширину панели. Тот же приём, что у
 * `GrContextMenu`, который так устроен с самого начала.
 */
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

/**
 * Контейнер пунктов — он же контейнер кольца фокуса.
 *
 * Панель `GrPopover` рисует `v-show`, поэтому содержимое слота существует в DOM
 * с монтирования: ссылка готова до первого открытия, и `focusAt` не приходится
 * ждать отрисовки панели.
 */
const menuEl = ref<HTMLElement | null>(null)

// Кольцо фокуса и поиск по буквам — общие с `GrContextMenu`: паттерн `menu`
// один, и вторая его реализация разошлась бы с первой незаметно для тестов.
const menu = useMenuItemsFocus({
  container: () => menuEl.value,
  close: () => close(),
})

function open(): void {
  if (props.disabled)
    return

  setOpen(true)
}

function close(): void {
  setOpen(false)
}

function toggle(): void {
  isOpen.value ? close() : open()
}

async function openWithFocus(first: boolean): Promise<void> {
  if (props.disabled)
    return

  setOpen(true)
  await nextTick()
  menu.focusAt(first ? 0 : -1)
}

/**
 * Что меню добавляет к `triggerProps` примитива.
 *
 * Примитив отдаёт ARIA и клик; стрелки, открывающие меню с первого или
 * последнего пункта, принадлежат паттерну `menu` и живут здесь.
 *
 * И `aria-disabled` вместо нативного `disabled`. Расхождение намеренное:
 * нативный атрибут убирает кнопку из таб-порядка, а у меню триггер обязан
 * оставаться фокусируемым — иначе пользователь клавиатуры не найдёт его вовсе и
 * не узнает, почему меню недоступно. Форм-контролу (`GrColorPicker`) верно
 * обратное, поэтому примитив оставляет нативный, а меню его перекрывает.
 */
function menuTriggerProps(popoverProps: Record<string, unknown>): Record<string, unknown> {
  return {
    ...popoverProps,
    'disabled': undefined,
    'aria-disabled': props.disabled || undefined,
    'onKeydown': onTriggerKeydown,
  }
}

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

watch(
  () => props.disabled,
  (value) => {
    if (value)
      close()
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

  return width ? { width } : undefined
})

const contentClasses = computed(() => grDropdownContentClass(props.contentClass))

defineExpose({ open, close, toggle })

defineSlots<{
  /**
   * Триггер панели. `triggerProps` обязаны попасть на сам интерактивный
   * элемент, а не на обёртку вокруг него: `aria-expanded` и `aria-controls`
   * читаются с того узла, который получает фокус, а клик приезжает вместе с ними.
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
    <GrPopover
      role="menu"
      padding="none"
      :open="isOpen"
      :placement="placement"
      :offset-px="offset"
      :trigger="trigger"
      :open-delay="openDelay"
      :close-delay="closeDelay"
      :disabled="disabled"
      :close-on-content-click="closeOnContentClick"
      :teleport-to="teleportTo"
      :auto-focus="false"
      @update:open="setOpen"
    >
      <template #trigger="{ triggerProps: popoverTriggerProps }">
        <slot
          name="trigger"
          :open="isOpen"
          :toggle="toggle"
          :close="close"
          :trigger-props="menuTriggerProps(popoverTriggerProps)"
        />
      </template>

      <template #content="{ close: closePanel }">
        <div
          ref="menuEl"
          data-gr-dropdown-panel
          :style="panelStyle"
          @keydown="menu.onKeydown"
        >
          <div data-gr-dropdown-content :class="contentClasses">
            <slot name="content" :close="closePanel" />
          </div>
        </div>
      </template>
    </GrPopover>
  </div>
</template>
