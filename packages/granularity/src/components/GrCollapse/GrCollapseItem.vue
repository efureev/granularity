<script setup lang="ts">
import ChevronDownIcon from '~icons/lucide/chevron-down'
import { computed, getCurrentInstance, inject, ref } from 'vue'

import GrIcon from '../GrIcon'

import { GR_COLLAPSE_CONTEXT, type GrCollapseValue } from './grCollapseContext'

/**
 * GrCollapseItem — одна секция `GrCollapse`. Должна использоваться строго внутри `GrCollapse`.
 *
 * @prop name — уникальный идентификатор секции (для `v-model` у `GrCollapse`); по умолчанию генерируется из `uid`.
 * @prop title — текст заголовка; можно заменить слотом `#title`.
 * @prop disabled — запрещает раскрытие/сворачивание секции.
 */
export interface GrCollapseItemProps {
  name?: GrCollapseValue
  title?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<GrCollapseItemProps>(), {
  name: undefined,
  title: undefined,
  disabled: false,
})

const collapse = inject(GR_COLLAPSE_CONTEXT)

if (!collapse) {
  throw new Error('GrCollapseItem must be used inside GrCollapse')
}

const collapseContext = collapse

const instance = getCurrentInstance()
const uid = instance?.uid ?? Math.random()

const resolvedName = computed<GrCollapseValue>(() => {
  if (typeof props.name === 'string' || typeof props.name === 'number')
    return props.name

  return uid
})

const resolvedDisabled = computed(() => collapseContext.disabled.value || props.disabled)
const expanded = computed(() => collapseContext.isActive(resolvedName.value))

const headerId = `ds-collapse-header-${uid}`
const panelId = `ds-collapse-panel-${uid}`

const triggerEl = ref<HTMLElement | null>(null)

function onToggle(): void {
  if (resolvedDisabled.value)
    return

  collapseContext.toggle(resolvedName.value)
}

function getAllTriggers(): HTMLElement[] {
  const root = triggerEl.value?.closest('[data-ds-collapse]')
  if (!root)
    return []

  return Array.prototype.slice.call(root.querySelectorAll<HTMLElement>('[data-ds-collapse-trigger]')) as HTMLElement[]
}

function focusRelative(direction: 1 | -1): void {
  const current = triggerEl.value
  if (!current)
    return

  const triggers = getAllTriggers()
  const index = triggers.indexOf(current)
  if (index === -1 || triggers.length === 0)
    return

  const nextIndex = (index + direction + triggers.length) % triggers.length
  triggers[nextIndex]?.focus()
}

function focusEdge(edge: 'start' | 'end'): void {
  const triggers = getAllTriggers()
  if (triggers.length === 0)
    return

  ;(edge === 'start' ? triggers[0] : triggers.at(-1))?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusRelative(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    focusRelative(-1)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    focusEdge('start')
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    focusEdge('end')
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    onToggle()
  }
}
</script>

<template>
  <div
    data-ds-collapse-item
    class="text-[var(--fg)]"
  >
    <h3 class="m-0">
      <button
        :id="headerId"
        ref="triggerEl"
        data-ds-collapse-trigger
        type="button"
        :aria-expanded="expanded ? 'true' : 'false'"
        :aria-controls="panelId"
        :disabled="resolvedDisabled"
        class="w-full px-4 py-3 flex items-center justify-between gap-4 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed"
        :class="resolvedDisabled ? '' : 'hover:bg-[var(--muted)]'"
        @click="onToggle"
        @keydown="onKeydown"
      >
        <span class="min-w-0">
          <slot name="title">
            <span class="text-sm font-600">
              {{ title }}
            </span>
          </slot>
        </span>

        <GrIcon
          size="sm"
          aria-hidden="true"
          data-ds-collapse-chevron
          class="shrink-0 transition-transform duration-150 text-[var(--muted-fg)]"
          :class="expanded ? 'rotate-180' : ''"
        >
          <ChevronDownIcon />
        </GrIcon>
      </button>
    </h3>

    <div
      :id="panelId"
      role="region"
      :aria-labelledby="headerId"
      class="grid transition-[grid-template-rows] duration-200"
      :class="expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <div class="px-4 pb-4 text-sm text-[var(--muted-fg)]">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>