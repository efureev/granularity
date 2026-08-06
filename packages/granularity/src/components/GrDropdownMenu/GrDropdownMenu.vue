<script setup lang="ts">
import GrDropdown from '../GrDropdown/GrDropdown.vue'
// Типы размещения и ширины — из владельца API, а не переобъявлением: расхождение
// обнаружилось бы только рантаймом.
import type { GrDropdownTrigger } from '../GrDropdown/GrDropdown.vue'
import type { GrDropdownWidth } from '../GrDropdown/grDropdownStyles'
import type { UseFloatingPlacement } from '../../composables/useFloating'

import GrDropdownMenuDivider from './GrDropdownMenuDivider.vue'
import GrDropdownMenuGroup from './GrDropdownMenuGroup.vue'
import GrDropdownMenuItem from './GrDropdownMenuItem.vue'
import GrDropdownMenuList from './GrDropdownMenuList.vue'
import {
  isMenuAction,
  isMenuSection,
  isMenuSeparator,
  type GrDropdownMenuAction,
  type GrDropdownMenuEntry,
} from './menuModel'

export interface GrDropdownMenuProps {
  /** Размещение панели относительно триггера; переворот при нехватке места остаётся. */
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
  /** Меню не открывается ничем; триггер остаётся фокусируемым. */
  disabled?: boolean
  /** Куда телепортировать панель (`body` по умолчанию). */
  teleportTo?: string | HTMLElement
  /** Закрывать по клику внутри content. */
  closeOnContentClick?: boolean
  /** Дополнительные классы content-контейнера; по умолчанию `p-0`. */
  contentClass?: string
  /**
   * Декларативное меню: пункты, группы и разделители массивом. Слот по
   * умолчанию сильнее — он для меню, которое из модели не собирается.
   */
  items?: GrDropdownMenuEntry[]

  // list wrapper
  /** Разделители между пунктами. */
  dividers?: boolean
  /** Верхний бордер контейнера списка. */
  borderTop?: boolean
  /** Нижний бордер контейнера списка. */
  borderBottom?: boolean
  /** Дополнительные классы для wrapper'а списка. */
  listClass?: string
}

withDefaults(defineProps<GrDropdownMenuProps>(), {
  placement: 'bottom-end',
  offset: 8,
  width: '12rem',
  trigger: 'click',
  openDelay: 120,
  closeDelay: 160,
  disabled: false,
  teleportTo: 'body',
  closeOnContentClick: true,
  // В `GrDropdown` есть `p-1`, поэтому здесь по умолчанию обнуляем padding,
  // чтобы пункты меню могли растягиваться до границ.
  contentClass: 'p-0',
  items: undefined,
  dividers: false,
  borderTop: false,
  borderBottom: false,
  listClass: '',
})

const emit = defineEmits<{
  /** Выбран пункт декларативного меню. */
  (e: 'select', item: GrDropdownMenuAction): void
}>()

function itemProps(item: GrDropdownMenuAction): Record<string, unknown> {
  return {
    href: item.href,
    target: item.target,
    rel: item.rel,
    external: item.external,
    disabled: item.disabled,
    variant: item.variant,
    role: item.role,
    checked: item.checked,
    icon: item.icon,
    shortcut: item.shortcut,
  }
}

function onSelect(item: GrDropdownMenuAction): void {
  if (item.disabled)
    return

  emit('select', item)
}
</script>

<template>
  <GrDropdown
    data-gr-dropdown-menu
    :placement="placement"
    :offset="offset"
    :width="width"
    :trigger="trigger"
    :open-delay="openDelay"
    :close-delay="closeDelay"
    :disabled="disabled"
    :teleport-to="teleportTo"
    :close-on-content-click="closeOnContentClick"
    :content-class="contentClass"
  >
    <template #trigger="slotProps">
      <slot name="trigger" v-bind="slotProps" />
    </template>

    <template #content="slotProps">
      <GrDropdownMenuList
        :dividers="dividers"
        :border-top="borderTop"
        :border-bottom="borderBottom"
        :class="listClass"
      >
        <slot v-bind="slotProps">
          <template v-for="(entry, index) in items ?? []">
            <GrDropdownMenuDivider
              v-if="isMenuSeparator(entry)"
              :key="`divider-${index}`"
              :inset="entry.inset"
            />

            <GrDropdownMenuGroup
              v-else-if="isMenuSection(entry)"
              :key="`group-${entry.title ?? index}`"
              :title="entry.title"
            >
              <GrDropdownMenuItem
                v-for="item in entry.items"
                :key="item.key"
                v-bind="itemProps(item)"
                @click="onSelect(item)"
              >
                {{ item.label }}
              </GrDropdownMenuItem>
            </GrDropdownMenuGroup>

            <GrDropdownMenuItem
              v-else-if="isMenuAction(entry)"
              :key="entry.key"
              v-bind="itemProps(entry)"
              @click="onSelect(entry)"
            >
              {{ entry.label }}
            </GrDropdownMenuItem>
          </template>
        </slot>
      </GrDropdownMenuList>
    </template>
  </GrDropdown>
</template>
