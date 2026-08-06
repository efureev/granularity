<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { type GrTabsSize, tabBadgeSizes, tablistSizes, tabSizes } from './grTabsStyles'

export type GrTab = {
  value: string
  label: string
  badge?: string
  disabled?: boolean
}

export type GrTabsProps = {
  modelValue: string
  tabs: GrTab[]
  /**
   * База id для ARIA-связки с `GrTabPanels`. Если задана, каждая вкладка
   * получает `id="<idBase>-tab-<value>"` и `aria-controls="<idBase>-panel-<value>"`.
   * Передайте тот же `idBase` в `GrTabPanels`, чтобы связать `tab`↔`tabpanel`.
   */
  idBase?: string
  size?: GrTabsSize
  /**
   * `automatic` (по умолчанию) — стрелка сразу переключает вкладку;
   * `manual` — стрелка двигает только фокус, выбор подтверждается
   * `Enter`/`Space`. Второй режим для вкладок с тяжёлой загрузкой: перебор
   * стрелками иначе тянет каждую панель.
   */
  activationMode?: GrTabsActivationMode
  /** Горизонтальный (по умолчанию) или вертикальный список вкладок. */
  orientation?: GrTabsOrientation
}

export type GrTabsActivationMode = 'automatic' | 'manual'
export type GrTabsOrientation = 'horizontal' | 'vertical'

/**
 * GrTabs — горизонтальная группа вкладок с паттерном WAI-ARIA `tablist`.
 *
 * A11y:
 * - `role="tablist"` на корне, `role="tab"` на каждой вкладке.
 * - Roving `tabindex`: активная вкладка `0`, остальные `-1`.
 * - Клавиатура: `ArrowLeft`/`ArrowRight` — цикличный переход, `Home`/`End` — к первой/последней.
 * - При переключении стрелками DOM-фокус программно переносится на новую вкладку.
 *
 * Сам компонент не рендерит `tabpanel` — это ответственность консьюмера (по `aria-controls`/внешней разметке).
 */
const props = withDefaults(defineProps<GrTabsProps>(), {
  idBase: undefined,
  size: undefined,
  activationMode: 'automatic',
  orientation: 'horizontal',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTabs' })

const tablistClass = computed(() => tablistSizes[resolvedSize.value])
const tabClass = computed(() => tabSizes[resolvedSize.value])
const badgeClass = computed(() => tabBadgeSizes[resolvedSize.value])

const buttonRefs = ref<HTMLButtonElement[]>([])

/**
 * Vue зовёт ref-функцию с `null`, когда узел исчез. Игнорировать такой вызов
 * нельзя: в массиве оставались отсоединённые от DOM кнопки, и `focus()` по
 * сократившемуся списку молча проваливался в `<body>`.
 */
function setButtonRef(el: unknown, index: number): void {
  if (el instanceof HTMLButtonElement)
    buttonRefs.value[index] = el
  else
    delete buttonRefs.value[index]

  if (buttonRefs.value.length > props.tabs.length)
    buttonRefs.value.length = props.tabs.length
}

const activeIndex = computed(() => props.tabs.findIndex(t => t.value === props.modelValue))

// Roving tabindex обязан всегда держать ровно один элемент с `0`. Если
// `modelValue` не совпал ни с одной вкладкой (пустое начальное значение,
// асинхронный список, удалённая активная вкладка), в таб-порядке остаётся
// первая доступная — иначе tablist выпадает из него целиком и молча.
const rovingIndex = computed(() => {
  if (activeIndex.value >= 0) return activeIndex.value

  const firstEnabled = props.tabs.findIndex(tab => !tab.disabled)
  return firstEnabled >= 0 ? firstEnabled : 0
})

function isEnabled(tab: GrTab): boolean {
  return !tab.disabled
}

const focusedIndex = ref(-1)

/** Роверная вкладка: при `manual` фокус может уехать вперёд выбора. */
const rovingFocusIndex = computed(() => (focusedIndex.value >= 0 ? focusedIndex.value : rovingIndex.value))

async function focusIndex(index: number): Promise<void> {
  focusedIndex.value = index
  await nextTick()
  buttonRefs.value[index]?.focus()
}

async function selectByIndex(index: number, focus = false): Promise<void> {
  const tab = props.tabs[index]
  if (!tab || !isEnabled(tab))
    return
  if (tab.value !== props.modelValue)
    emit('update:modelValue', tab.value)
  if (focus)
    await focusIndex(index)
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

  const currentIndex = focusedIndex.value >= 0 ? focusedIndex.value : (activeIndex.value < 0 ? 0 : activeIndex.value)
  let nextIndex = -1

  const forward = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
  const backward = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'

  switch (event.key) {
    case forward:
      nextIndex = findNextEnabled(currentIndex, 1)
      break
    case backward:
      nextIndex = findNextEnabled(currentIndex, -1)
      break
    case 'Home':
      nextIndex = firstEnabled()
      break
    case 'End':
      nextIndex = lastEnabled()
      break
    case 'Enter':
    case ' ':
      // В ручном режиме выбор подтверждается явно.
      if (props.activationMode === 'manual' && focusedIndex.value >= 0) {
        event.preventDefault()
        void selectByIndex(focusedIndex.value, true)
      }
      return
    default:
      return
  }

  if (nextIndex < 0)
    return

  event.preventDefault()

  if (props.activationMode === 'manual') {
    void focusIndex(nextIndex)
    return
  }

  void selectByIndex(nextIndex, true)
}

function onClick(tab: GrTab, index: number): void {
  if (!isEnabled(tab))
    return

  focusedIndex.value = index

  if (tab.value !== props.modelValue)
    emit('update:modelValue', tab.value)
}
</script>

<template>
  <div
    role="tablist"
    data-gr-tabs
    :aria-orientation="orientation"
    class="inline-flex rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-muted)]"
    :class="[tablistClass, orientation === 'vertical' ? 'flex-col' : 'flex-wrap']"
    @keydown="onKeydown"
  >
    <button
      v-for="(tab, index) in tabs"
      :id="idBase ? `${idBase}-tab-${tab.value}` : undefined"
      :key="tab.value"
      :ref="el => setButtonRef(el, index)"
      type="button"
      role="tab"
      data-gr-tab
      :aria-controls="idBase ? `${idBase}-panel-${tab.value}` : undefined"
      :aria-selected="tab.value === modelValue ? 'true' : 'false'"
      :aria-disabled="tab.disabled ? 'true' : undefined"
      :tabindex="index === rovingFocusIndex ? 0 : -1"
      class="rounded-[var(--gr-radius-md)] font-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      :class="[
        tabClass,
        tab.disabled
          ? 'cursor-not-allowed text-[var(--gr-muted-fg)]'
          : tab.value === modelValue
            ? 'bg-[var(--gr-card)] text-[var(--gr-fg)] border border-[var(--gr-brd)]'
            : 'text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] hover:bg-[color-mix(in_srgb,var(--gr-card)_70%,transparent)]',
      ]"
      @click="onClick(tab, index)"
    >
      <span class="inline-flex items-center gap-2">
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge"
          class="rounded-full bg-[var(--gr-secondary)] text-[var(--gr-secondary-fg)]"
          :class="badgeClass"
        >
          {{ tab.badge }}
        </span>
      </span>
    </button>
  </div>
</template>
