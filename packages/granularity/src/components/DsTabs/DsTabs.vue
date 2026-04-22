<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

export type DsTab = {
  value: string
  label: string
  badge?: string
  disabled?: boolean
}

export type DsTabsProps = {
  modelValue: string
  tabs: DsTab[]
}

/**
 * DsTabs — горизонтальная группа вкладок с паттерном WAI-ARIA `tablist`.
 *
 * A11y:
 * - `role="tablist"` на корне, `role="tab"` на каждой вкладке.
 * - Roving `tabindex`: активная вкладка `0`, остальные `-1`.
 * - Клавиатура: `ArrowLeft`/`ArrowRight` — цикличный переход, `Home`/`End` — к первой/последней.
 * - При переключении стрелками DOM-фокус программно переносится на новую вкладку.
 *
 * Сам компонент не рендерит `tabpanel` — это ответственность консьюмера (по `aria-controls`/внешней разметке).
 */
const props = defineProps<DsTabsProps>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const buttonRefs = ref<HTMLButtonElement[]>([])

function setButtonRef(el: unknown, index: number): void {
  if (el instanceof HTMLButtonElement)
    buttonRefs.value[index] = el
}

const activeIndex = computed(() => props.tabs.findIndex(t => t.value === props.modelValue))

function isEnabled(tab: DsTab): boolean {
  return !tab.disabled
}

async function selectByIndex(index: number, focus = false): Promise<void> {
  const tab = props.tabs[index]
  if (!tab || !isEnabled(tab))
    return
  if (tab.value !== props.modelValue)
    emit('update:modelValue', tab.value)
  if (focus) {
    await nextTick()
    buttonRefs.value[index]?.focus()
  }
}

function findNextEnabled(from: number, direction: 1 | -1): number {
  const length = props.tabs.length
  if (length === 0)
    return -1
  let index = from
  for (let i = 0; i < length; i++) {
    index = (index + direction + length) % length
    const tab = props.tabs[index]
    if (tab && isEnabled(tab))
      return index
  }
  return -1
}

function firstEnabled(): number {
  return props.tabs.findIndex(isEnabled)
}

function lastEnabled(): number {
  for (let i = props.tabs.length - 1; i >= 0; i--) {
    const tab = props.tabs[i]
    if (tab && isEnabled(tab))
      return i
  }
  return -1
}

function onKeydown(event: KeyboardEvent): void {
  if (props.tabs.length === 0)
    return

  const currentIndex = activeIndex.value < 0 ? 0 : activeIndex.value
  let nextIndex = -1

  switch (event.key) {
    case 'ArrowRight':
      nextIndex = findNextEnabled(currentIndex, 1)
      break
    case 'ArrowLeft':
      nextIndex = findNextEnabled(currentIndex, -1)
      break
    case 'Home':
      nextIndex = firstEnabled()
      break
    case 'End':
      nextIndex = lastEnabled()
      break
    default:
      return
  }

  if (nextIndex < 0)
    return

  event.preventDefault()
  void selectByIndex(nextIndex, true)
}

function onClick(tab: DsTab): void {
  if (!isEnabled(tab))
    return
  if (tab.value !== props.modelValue)
    emit('update:modelValue', tab.value)
}
</script>

<template>
  <div
    role="tablist"
    data-ds-tabs
    class="inline-flex flex-wrap gap-1 rounded-[var(--ds-radius-lg)] border border-[var(--brd)] bg-[var(--muted)] p-1"
    @keydown="onKeydown"
  >
    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      :ref="el => setButtonRef(el, index)"
      type="button"
      role="tab"
      data-ds-tab
      :aria-selected="tab.value === modelValue ? 'true' : 'false'"
      :aria-disabled="tab.disabled ? 'true' : undefined"
      :disabled="tab.disabled"
      :tabindex="tab.value === modelValue ? 0 : -1"
      class="h-9 px-3 rounded-[10px] text-sm font-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-60 disabled:cursor-not-allowed"
      :class="tab.value === modelValue
        ? 'bg-[var(--card)] text-[var(--fg)] border border-[var(--brd)]'
        : 'text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--card)_70%,transparent)]'"
      @click="onClick(tab)"
    >
      <span class="inline-flex items-center gap-2">
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge"
          class="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-fg)]"
        >
          {{ tab.badge }}
        </span>
      </span>
    </button>
  </div>
</template>
