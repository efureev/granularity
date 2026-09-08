<script setup lang="ts">
/**
 * GrSidebarItem — пункт навигации боковой панели `GrSidebar`.
 *
 * Контракт:
 * - развёрнутая панель — `[иконка] метка [бейдж]`;
 * - свёрнутая панель — только иконка; если иконки нет, показывается ПЕРВАЯ БУКВА
 *   метки (uppercase). Имя пункту даёт `aria-label`, а подпись показывает
 *   `GrTooltip`: нативный `title` появлялся только по наведению, то есть с
 *   клавиатуры свёрнутую панель было не прочесть.
 *
 * Корневой тег: `as` → `<a href>` → `<button>` (в этом порядке).
 */
import { computed, inject, markRaw, type Component } from 'vue'

import GrTooltip from '../GrTooltip/GrTooltip.vue'

import { grSidebarItemClass, itemBadgeClass, itemLetterClass } from './grSidebarStyles'
import { GR_SIDEBAR_KEY } from './sidebarContext'

export interface GrSidebarItemProps {
  label: string
  /** Иконка: класс UnoCSS-иконки (`'i-lucide-home'`) или Vue-компонент. */
  icon?: string | Component
  href?: string
  as?: string | Component
  active?: boolean
  disabled?: boolean
  badge?: string | number
}

const props = withDefaults(defineProps<GrSidebarItemProps>(), {
  icon: undefined,
  href: undefined,
  as: undefined,
  active: false,
  disabled: false,
  badge: undefined,
})

const sidebar = inject(GR_SIDEBAR_KEY, null)
const collapsed = computed(() => sidebar?.collapsed.value ?? false)

/**
 * Подсказка уходит **от** панели: у левой — вправо, у правой — влево. Иначе
 * она легла бы поверх самой панели и закрыла соседние пункты.
 */
const tooltipPlacement = computed(() => (sidebar?.position.value === 'right' ? 'left' : 'right'))

/*
 * Обёртка тултипом появляется только в свёрнутом виде: в развёрнутом подпись
 * видна текстом, и лишний узел в разметке ни к чему.
 *
 * В шаблоне это `v-if`/`v-else`, и комментарию там не место: узел-комментарий
 * перед корнем делает компонент многокорневым, а у такого не работает проброс
 * атрибутов и `wrapper.element` указывает не туда.
 *
 * `describe-trigger="false"` обязателен — имя пункту уже даёт `aria-label` с
 * той же подписью, и описание тем же текстом диктор прочитал бы дважды.
 * `block` — потому что пункт тянется на всю ширину рейла, а обёртка по
 * умолчанию `inline-flex` схлопнула бы его вместе с подсветкой и кольцом
 * фокуса.
 */

const isStringIcon = computed(() => typeof props.icon === 'string')
const iconComponent = computed(() => (props.icon && typeof props.icon !== 'string' ? markRaw(props.icon as Component) : null))
const firstLetter = computed(() => props.label.trim().charAt(0).toUpperCase() || '•')

const rootTag = computed<string | Component>(() => {
  if (props.disabled)
    return 'span'
  if (props.as)
    return typeof props.as === 'string' ? props.as : markRaw(props.as)
  return props.href ? 'a' : 'button'
})

/**
 * Компонент-ссылка (`Link` от Inertia, `RouterLink`) рендерит `<a>` сам, и без
 * `href` он ведёт в никуда. Строковый тег, кроме `a`, атрибут не понимает —
 * там он и гасится.
 */
const rootHref = computed(() => (
  typeof rootTag.value === 'string' && rootTag.value !== 'a' ? undefined : props.href
))

const rootClass = computed(() => grSidebarItemClass({
  collapsed: collapsed.value,
  disabled: props.disabled,
  active: props.active,
}))
</script>

<template>
  <GrTooltip
    v-if="collapsed"
    :text="label"
    :placement="tooltipPlacement"
    block
    :describe-trigger="false"
    data-gr-sidebar-item-tooltip
  >
    <component
      :is="rootTag"
      data-gr-sidebar-item
      :type="rootTag === 'button' ? 'button' : undefined"
      :href="rootHref"
      :aria-current="active ? 'page' : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-label="label"
      :class="rootClass"
    >
      <span class="flex h-5 w-5 shrink-0 items-center justify-center">
        <component :is="iconComponent" v-if="iconComponent" class="h-5 w-5" aria-hidden="true" />
        <span v-else-if="isStringIcon" :class="icon" class="block h-5 w-5" aria-hidden="true" />
        <span v-else :class="itemLetterClass" aria-hidden="true">{{ firstLetter }}</span>
      </span>
    </component>
  </GrTooltip>

  <component
    :is="rootTag"
    v-else
    data-gr-sidebar-item
    :type="rootTag === 'button' ? 'button' : undefined"
    :href="rootHref"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="rootClass"
  >
    <span class="flex h-5 w-5 shrink-0 items-center justify-center">
      <component :is="iconComponent" v-if="iconComponent" class="h-5 w-5" aria-hidden="true" />
      <span v-else-if="isStringIcon" :class="icon" class="block h-5 w-5" aria-hidden="true" />
    </span>

    <span class="min-w-0 flex-1 truncate text-left">{{ label }}</span>
    <span v-if="badge != null" :class="itemBadgeClass">{{ badge }}</span>
  </component>
</template>
