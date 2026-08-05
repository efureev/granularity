<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'

import IconCheck from '~icons/lucide/check'

import {
  grDropdownMenuItemClass,
  itemIndicatorClass,
  itemShortcutClass,
  type GrDropdownMenuItemAlign,
  type GrDropdownMenuItemVariant,
} from './grDropdownMenuStyles'

defineOptions({
  inheritAttrs: false,
})

export type { GrDropdownMenuItemAlign, GrDropdownMenuItemVariant } from './grDropdownMenuStyles'

/**
 * Роль пункта. `menuitemcheckbox`/`menuitemradio` — пункты-переключатели: они
 * обязаны нести `aria-checked`, иначе AT прочитает их как обычные команды.
 */
export type GrDropdownMenuItemRole = 'menuitem' | 'menuitemcheckbox' | 'menuitemradio'

export interface GrDropdownMenuItemProps {
  as?: string | Component
  disabled?: boolean
  align?: GrDropdownMenuItemAlign
  variant?: GrDropdownMenuItemVariant
  role?: GrDropdownMenuItemRole
  /** Состояние переключателя. Осмысленно с `role="menuitemcheckbox|radio"`. */
  checked?: boolean
  /** Иконка слева. Слот `#icon` сильнее. */
  icon?: Component
  /** Подпись сочетания клавиш справа. Слот `#shortcut` сильнее. */
  shortcut?: string
}

const props = withDefaults(defineProps<GrDropdownMenuItemProps>(), {
  as: 'button',
  disabled: false,
  align: 'left',
  variant: 'default',
  role: 'menuitem',
  checked: undefined,
  icon: undefined,
  shortcut: undefined,
})

const attrs = useAttrs()

const isNativeButton = computed(() => props.as === 'button' || props.as === undefined)
// Отметка занимает место всегда, когда пункт переключаемый: иначе строки
// «включено» и «выключено» разъезжаются по горизонтали.
const isCheckable = computed(() => props.role !== 'menuitem')

const className = computed(() => grDropdownMenuItemClass({
  align: props.align,
  variant: props.variant,
  disabled: props.disabled,
}))

function onClickCapture(e: MouseEvent): void {
  if (!props.disabled)
    return

  e.preventDefault()
  // `stopImmediatePropagation`, а не `stopPropagation`: обработчик, навешенный
  // на сам пункт через `v-bind="attrs"`, живёт на этом же элементе, и обычная
  // остановка всплытия его не отменяет.
  e.stopImmediatePropagation()
}
</script>

<template>
  <component
    :is="as"
    v-bind="attrs"
    data-gr-dropdown-menu-item
    :role="role"
    :class="className"
    :type="isNativeButton ? (attrs.type as any) ?? 'button' : undefined"
    :disabled="isNativeButton ? disabled : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-checked="isCheckable ? (checked ? 'true' : 'false') : undefined"
    :tabindex="disabled ? -1 : (attrs.tabindex as any)"
    @click.capture="onClickCapture"
  >
    <span
      v-if="isCheckable"
      data-gr-dropdown-menu-item-indicator
      :class="itemIndicatorClass"
      aria-hidden="true"
    >
      <IconCheck v-if="checked" :class="itemIndicatorClass" />
    </span>

    <slot name="icon">
      <component
        :is="icon"
        v-if="icon"
        :class="itemIndicatorClass"
        aria-hidden="true"
      />
    </slot>

    <slot />

    <slot name="shortcut">
      <span v-if="shortcut" data-gr-dropdown-menu-item-shortcut :class="itemShortcutClass">{{ shortcut }}</span>
    </slot>
  </component>
</template>
