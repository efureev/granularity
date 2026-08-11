<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import IconX from '~icons/lucide/x'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import {
  grTabsBadgeClass,
  grTabsCloseClass,
  grTabsEmptyClass,
  grTabsListClass,
  grTabsTabClass,
  tabCloseIconSizes,
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
  /** Перекрывает `closable` ряда в обе стороны: закрепить вкладку или закрыть одну её. */
  closable?: boolean
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
  /**
   * Крестик на вкладках и закрытие по `Delete`/`Backspace`. Точечно снимается
   * `closable: false` у самой вкладки.
   */
  closable?: boolean
  /** Текст, когда список вкладок пуст. Слот `#empty` сильнее. */
  emptyText?: string
}

export interface GrTabsEmits {
  (e: 'update:modelValue', value: string): void
  /**
   * Просьба закрыть вкладку. Компонент список не трогает: `tabs` — проп, и
   * закрытие может не состояться («сохранить изменения?»).
   */
  (e: 'close', value: string): void
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
  closable: false,
  emptyText: undefined,
})

defineSlots<{
  /** Содержимое вкладки целиком — вместо подписи, иконки и счётчика. Крестик остаётся. */
  tab?: (props: { tab: GrTab, active: boolean, disabled: boolean }) => unknown
  /** Пустой ряд — вместо текста из локали. */
  empty?: () => unknown
}>()

const emit = defineEmits<GrTabsEmits>()

const { t } = useGranularityTranslations()

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
const closeClass = computed(() => grTabsCloseClass(resolvedSize.value))
const closeIconClass = computed(() => tabCloseIconSizes[resolvedSize.value])
const emptyClass = computed(() => grTabsEmptyClass(resolvedSize.value))

const isEmpty = computed(() => props.tabs.length === 0)
const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.tabs.empty', 'Nothing here yet'))
const closeTitle = computed(() => t('gr.tabs.close', 'Close tab'))

/** Отключённая вкладка не принимает взаимодействия, а закрытие — тоже взаимодействие. */
function isClosable(tab: GrTab): boolean {
  return !tab.disabled && (tab.closable ?? props.closable)
}

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
    case 'Delete':
    case 'Backspace': {
      // Единственный клавиатурный путь к закрытию: крестик в таб-порядке не стоит.
      const tab = props.tabs[currentIndex]
      if (tab && isClosable(tab)) {
        event.preventDefault()
        requestClose(currentIndex)
      }
      return
    }
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

/**
 * Закрытая вкладка, которая держала фокус. Компонент список не укорачивает —
 * это делает потребитель, — поэтому фокус возвращается только после того, как
 * `tabs` действительно стал короче.
 */
let pendingClose: { index: number, value: string } | null = null

function requestClose(index: number): void {
  const tab = props.tabs[index]
  if (!tab || !isClosable(tab))
    return

  const held = buttonRefs.value[index] === document.activeElement
  pendingClose = held ? { index, value: tab.value } : null

  emit('close', tab.value)
}

// Без этого клавиатурное закрытие роняет фокус в `<body>`: кнопка, на которой
// он стоял, исчезает из DOM вместе со вкладкой.
watch(() => props.tabs.length, async (next, prev) => {
  const pending = pendingClose
  pendingClose = null

  if (!pending || next >= prev)
    return
  // Ушла не та вкладка — потребитель поменял список по своей причине.
  if (props.tabs.some(tab => tab.value === pending.value))
    return

  await nextTick()

  const target = Math.min(pending.index, next - 1)
  if (target >= 0)
    void focusIndex(target)
  else
    focusedIndex.value = -1
})

function onClick(event: MouseEvent, tab: GrTab, index: number): void {
  if (!isEnabled(tab))
    return

  // Крестик — не кнопка, поэтому его клик приходит сюда же и разбирается по цели.
  if (event.target instanceof Element && event.target.closest('[data-gr-tab-close]')) {
    requestClose(index)
    return
  }

  focusedIndex.value = index

  if (tab.value !== props.modelValue)
    emit('update:modelValue', tab.value)
}
</script>

<template>
  <!--
    Пустой ряд — не пустой `tablist`: роль обязана владеть потомками `tab`,
    и текст внутри неё был бы нарушением, а не пустым состоянием.
  -->
  <div v-if="isEmpty" data-gr-tabs-empty :class="emptyClass">
    <slot name="empty">
      {{ resolvedEmptyText }}
    </slot>
  </div>

  <div
    v-else
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
      :aria-keyshortcuts="isClosable(tab) ? 'Delete' : undefined"
      :tabindex="index === rovingFocusIndex ? 0 : -1"
      :class="tabClass(tab)"
      @click="onClick($event, tab, index)"
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

        <!-- Снаружи слота: своя разметка вкладки не должна отнимать закрытие. -->
        <span
          v-if="isClosable(tab)"
          data-gr-tab-close
          :class="closeClass"
          :title="closeTitle"
          aria-hidden="true"
        >
          <IconX :class="closeIconClass" />
        </span>
      </span>
    </button>
  </div>
</template>
