<script setup lang="ts">
import GrDropdown from '../GrDropdown/GrDropdown.vue'

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

export type GrDropdownMenuAlign = 'left' | 'right' | 'center'
export type GrDropdownMenuWidth = 'auto' | '20' | '48' | '60' | '64' | '80'

export interface GrDropdownMenuProps {
  /** Выравнивание панели относительно триггера. */
  align?: GrDropdownMenuAlign
  /** Ширина панели. */
  width?: GrDropdownMenuWidth
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
  align: 'right',
  width: '48',
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
    as: item.href ? 'a' : undefined,
    href: item.href,
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
    :align="align"
    :width="width"
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
