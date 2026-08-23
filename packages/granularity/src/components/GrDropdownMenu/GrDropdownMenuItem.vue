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
  /** Пункт-ссылка. У выключенного пункта не рендерится: ссылка осталась бы рабочей. */
  href?: string
  target?: string
  rel?: string
  /** Шорткат для `target="_blank"` + `rel="noopener noreferrer"`. */
  external?: boolean
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
  href: undefined,
  target: undefined,
  rel: undefined,
  external: false,
  align: 'left',
  variant: 'default',
  role: 'menuitem',
  checked: undefined,
  icon: undefined,
  shortcut: undefined,
})

const attrs = useAttrs()

// Полиморфный корень: явный `as` сильнее всего, иначе `href` сам делает пункт
// ссылкой — как у `GrButton`, чтобы не приходилось задавать `as="a"` вручную.
const renderAs = computed<string | Component>(() => {
  if (props.as && props.as !== 'button')
    return props.as
  return props.href ? 'a' : 'button'
})

const isNativeButton = computed(() => renderAs.value === 'button')

// Выключенный пункт остаётся ссылкой, если оставить ему `href`: средняя кнопка и
// контекстное меню браузера обойдут любой перехват клика (тот же приём в `GrButton`).
const resolvedHref = computed(() => (props.disabled ? undefined : props.href))
const resolvedTarget = computed(() => props.target ?? (props.external ? '_blank' : undefined))
const resolvedRel = computed(() =>
  props.rel ?? (resolvedTarget.value === '_blank' ? 'noopener noreferrer' : undefined),
)
// Отметка занимает место всегда, когда пункт переключаемый: иначе строки
// «включено» и «выключено» разъезжаются по горизонтали.
const isCheckable = computed(() => props.role !== 'menuitem')

const className = computed(() => grDropdownMenuItemClass({
  align: props.align,
  variant: props.variant,
  disabled: props.disabled,
}))

/**
 * Roving tabindex паттерна menu: табируемым остаётся триггер, а внутри панели
 * фокусом распоряжаются стрелки (`GrDropdown` наводит его программно). Без
 * этого `Tab` ходил бы по пунктам, и меню было бы списком кнопок, а не меню.
 *
 * Выключённый пункт из обхода **не** выпадает: `aria-disabled` вместо нативного
 * `disabled` оставляет его фокусируемым, и пользователь узнаёт, что действие
 * существует, но сейчас недоступно (рекомендация WAI-ARIA APG).
 */
const resolvedTabindex = computed(() => (attrs.tabindex as number | string | undefined) ?? -1)

function onClickCapture(e: MouseEvent): void {
  if (!props.disabled)
    return

  e.preventDefault()
  // `stopImmediatePropagation`, а не `stopPropagation`: обработчик, навешенный
  // на сам пункт через `v-bind="attrs"`, живёт на этом же элементе, и обычная
  // остановка всплытия его не отменяет.
  e.stopImmediatePropagation()
}

defineSlots<{
  /** Подпись пункта вместо пропа `label`. */
  default?: () => any
  /** Иконка перед подписью. */
  icon?: () => any
  /** Сочетание клавиш справа — обычно `GrKbd`. */
  shortcut?: () => any
}>()
</script>

<template>
  <component
    :is="renderAs"
    v-bind="attrs"
    data-gr-dropdown-menu-item
    :role="role"
    :class="className"
    :type="isNativeButton ? (attrs.type as any) ?? 'button' : undefined"
    :href="resolvedHref"
    :target="resolvedHref ? resolvedTarget : undefined"
    :rel="resolvedHref ? resolvedRel : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-checked="isCheckable ? (checked ? 'true' : 'false') : undefined"
    :tabindex="resolvedTabindex"
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
