<script setup lang="ts">
/**
 * GrSidebarItem — пункт навигации боковой панели `GrSidebar`.
 *
 * Контракт:
 * - развёрнутая панель — `[иконка] метка [бейдж]`;
 * - свёрнутая панель — только иконка; если иконки нет, показывается ПЕРВАЯ БУКВА
 *   метки (uppercase). В свёрнутом виде метка уходит в `title`/`aria-label` для
 *   доступности и tooltip.
 *
 * Корневой тег: `as` → `<a href>` → `<button>` (в этом порядке).
 */
import { computed, inject, markRaw, type Component } from 'vue'

import { GR_SIDEBAR_KEY } from './sidebarContext'

const props = withDefaults(defineProps<{
  label: string
  /** Иконка: класс UnoCSS-иконки (`'i-lucide-home'`) или Vue-компонент. */
  icon?: string | Component
  href?: string
  as?: string | Component
  active?: boolean
  disabled?: boolean
  badge?: string | number
}>(), {
  icon: undefined,
  href: undefined,
  as: undefined,
  active: false,
  disabled: false,
  badge: undefined,
})

const sidebar = inject(GR_SIDEBAR_KEY, null)
const collapsed = computed(() => sidebar?.collapsed.value ?? false)

const isStringIcon = computed(() => typeof props.icon === 'string')
const iconComponent = computed(() => (props.icon && typeof props.icon !== 'string' ? markRaw(props.icon as Component) : null))
const firstLetter = computed(() => props.label.trim().charAt(0).toUpperCase() || '•')

const rootTag = computed<string | Component>(() => {
  if (props.disabled) return 'span'
  if (props.as) return typeof props.as === 'string' ? props.as : markRaw(props.as)
  return props.href ? 'a' : 'button'
})

const rootClass = computed(() => [
  'group relative flex w-full items-center rounded-lg text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
  collapsed.value ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2',
  props.disabled
    ? 'cursor-not-allowed opacity-50'
    : props.active
      ? 'bg-[var(--muted)] font-600 text-[var(--fg)]'
      : 'text-[var(--sidebar-fg)] hover:bg-[color-mix(in_srgb,var(--sidebar-fg)_8%,transparent)]',
])
</script>

<template>
  <component
    :is="rootTag"
    data-ds-sidebar-item
    :type="rootTag === 'button' ? 'button' : undefined"
    :href="rootTag === 'a' ? href : undefined"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :title="collapsed ? label : undefined"
    :aria-label="collapsed ? label : undefined"
    :class="rootClass"
  >
    <span class="flex h-5 w-5 shrink-0 items-center justify-center">
      <component :is="iconComponent" v-if="iconComponent" class="h-5 w-5" aria-hidden="true" />
      <span v-else-if="isStringIcon" :class="icon" class="block h-5 w-5" aria-hidden="true" />
      <span v-else-if="collapsed" class="text-[13px] font-700 leading-none" aria-hidden="true">{{ firstLetter }}</span>
    </span>

    <template v-if="!collapsed">
      <span class="min-w-0 flex-1 truncate text-left">{{ label }}</span>
      <span
        v-if="badge != null"
        class="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--sidebar-fg)_12%,transparent)] px-1.5 py-0.5 text-[11px] font-600"
      >{{ badge }}</span>
    </template>
  </component>
</template>
