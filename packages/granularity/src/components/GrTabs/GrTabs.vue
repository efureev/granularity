<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import {
  grTabsBadgeClass,
  grTabsListClass,
  grTabsTabClass,
  tabContentClass,
  tabIconClass,
  type GrTabsOrientation,
  type GrTabsSize,
  type GrTabsVariant,
} from './grTabsStyles'

export interface GrTab {
  value: string
  label: string
  badge?: string
  /** UnoCSS-класс иконки слева от подписи (например `i-lucide-user`). */
  icon?: string
  disabled?: boolean
}

export interface GrTabsProps {
  modelValue: string
  tabs: GrTab[]
  /**
   * База id для ARIA-связки с `GrTabPanels`. Если задана, каждая вкладка
   * получает `id="<idBase>-tab-<value>"` и `aria-controls="<idBase>-panel-<value>"`.
   * Передайте тот же `idBase` в `GrTabPanels`, чтобы связать `tab`↔`tabpanel`.
   */
  idBase?: string
  size?: GrTabsSize
  /** Вид ряда: обойма с таблетками или ряд с подчёркиванием. */
  variant?: GrTabsVariant
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

export interface GrTabsEmits {
  (e: 'update:modelValue', value: string): void
}

export type GrTabsActivationMode = 'automatic' | 'manual'

export type { GrTabsOrientation, GrTabsVariant } from './grTabsStyles'

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
  // Дефолт живёт в резолвере: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  variant: undefined,
  activationMode: 'automatic',
  orientation: 'horizontal',
})

defineSlots<{
  /** Содержимое вкладки целиком — вместо подписи, иконки и счётчика. */
  tab?: (props: { tab: GrTab, active: boolean, disabled: boolean }) => unknown
}>()

const emit = defineEmits<GrTabsEmits>()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTabs' })
const resolvedVariant = useGrComponentProp('GrTabs', 'variant', () => props.variant, 'pills')

const tablistClass = computed(() => grTabsListClass({
  variant: resolvedVariant.value,
  size: resolvedSize.value,
  orientation: props.orientation,
}))

function tabClass(tab: GrTab): string {
  return grTabsTabClass({
    variant: resolvedVariant.value,
    size: resolvedSize.value,
    active: tab.value === props.modelValue,
    disabled: Boolean(tab.disabled),
  })
}

const badgeClass = computed(() => grTabsBadgeClass(resolvedSize.value))

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
  scrollIntoView(index)
}

/**
 * Ряд прокручивается, а не переносится, поэтому активная вкладка может уехать
 * за край — например, когда её выбрали снаружи. `scrollIntoView` нет в jsdom и
 * в старых движках, поэтому вызов необязательный.
 */
function scrollIntoView(index: number): void {
  buttonRefs.value[index]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
}

watch(() => props.modelValue, async () => {
  await nextTick()
  if (activeIndex.value >= 0)
    scrollIntoView(activeIndex.value)
})

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
    :class="tablistClass"
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
      :class="tabClass(tab)"
      @click="onClick(tab, index)"
    >
      <span :class="tabContentClass">
        <slot
          name="tab"
          :tab="tab"
          :active="tab.value === modelValue"
          :disabled="Boolean(tab.disabled)"
        >
          <span v-if="tab.icon" :class="[tabIconClass, tab.icon]" aria-hidden="true" />
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge" :class="badgeClass">
            {{ tab.badge }}
          </span>
        </slot>
      </span>
    </button>
  </div>
</template>
