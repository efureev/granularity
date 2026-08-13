<script setup lang="ts">
import { computed, nextTick, ref, watch, type Component } from 'vue'

import IconX from '~icons/lucide/x'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useRovingFocus } from '../../composables/useRovingFocus'
import { iconClass, iconTag } from '../shared/icon'
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
  /**
   * Иконка слева от подписи: Vue-компонент либо класс иконки вашей UnoCSS-сборки
   * (`'i-lucide-user'` — тогда нужен ваш `presetIcons`, см. `docs/installation.md`).
   */
  icon?: string | Component
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

function isEnabled(tab: GrTab): boolean {
  return !tab.disabled
}

const tabIndexes = computed(() => props.tabs.map((_, index) => index))

/**
 * Кольцо roving-фокуса. При `activationMode: 'manual'` фокус уезжает вперёд
 * выбора — это и есть разница между `activeKey` примитива и `initialKey`:
 * первый ведёт фокус, второй подставляет выбранную вкладку, пока фокус не
 * трогали.
 *
 * Выбор стрелка **не** переносит: этим заведует `onKeydown` по
 * `activationMode`. Через `onMove` это выразить нельзя — клик тоже зовёт
 * `focusKey`, и выбор эмитился бы дважды.
 */
const roving = useRovingFocus<number>({
  items: () => tabIndexes.value,
  elementFor: index => buttonRefs.value[index],
  isDisabled: index => Boolean(props.tabs[index]?.disabled),
  orientation: () => (props.orientation === 'vertical' ? 'vertical' : 'horizontal'),
  skipDisabled: () => true,
  /**
   * Пока фокус не трогали, остановку `Tab` держит выбранная вкладка. Если
   * `modelValue` не совпал ни с одной (пустое начальное значение, асинхронный
   * список, удалённая активная вкладка), примитив ставит её на первую
   * доступную — иначе tablist выпал бы из обхода целиком и молча.
   *
   * Выключенность здесь не проверяется намеренно: на кнопке `aria-disabled`, а
   * не нативный `disabled`, поэтому выключенная вкладка фокусируется и держать
   * остановку вправе.
   */
  initialKey: () => (activeIndex.value >= 0 ? activeIndex.value : undefined),
  /**
   * Прокрутка до фокуса, а не после: иначе браузер доскроллит сам по-своему, и
   * ряд дёрнется дважды. Синхронно — фокус обязан остаться в том же такте, что
   * и раньше: тик, где он нужен, добавляет `focusIndex`.
   */
  beforeFocus: index => scrollIntoView(index),
})

/**
 * Фокус после перерисовки — для путей, где список только что изменился
 * (закрытие вкладки). Клавиатура идёт через примитив напрямую: там ряд уже
 * отрисован, и лишний тик только отложил бы фокус.
 */
async function focusIndex(index: number): Promise<void> {
  await nextTick()
  await roving.focusKey(index)
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

function onKeydown(event: KeyboardEvent): void {
  if (props.tabs.length === 0)
    return

  const currentIndex = roving.rovingKey.value ?? 0

  switch (event.key) {
    case 'Enter':
    case ' ':
      // В ручном режиме выбор подтверждается явно — на той вкладке, где фокус.
      if (props.activationMode === 'manual') {
        event.preventDefault()
        void selectByIndex(currentIndex, false)
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
  }

  // Стрелки, `Home`, `End` — фокус ведёт примитив по объявленной ориентации.
  if (!roving.handleNavigationKeys(event))
    return

  // `automatic`: выбор едет за фокусом. `manual`: ждёт `Enter`/`Space`.
  if (props.activationMode !== 'manual')
    void selectByIndex(roving.rovingKey.value ?? currentIndex, false)
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
    roving.reset()
})

function onClick(event: MouseEvent, tab: GrTab, index: number): void {
  if (!isEnabled(tab))
    return

  // Крестик — не кнопка, поэтому его клик приходит сюда же и разбирается по цели.
  if (event.target instanceof Element && event.target.closest('[data-gr-tab-close]')) {
    requestClose(index)
    return
  }

  roving.setActive(index)

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
      :tabindex="roving.tabindexFor(index)"
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
          <component
            :is="iconTag(tab.icon)"
            v-if="tab.icon"
            :class="[tabIconClass, iconClass(tab.icon)]"
            aria-hidden="true"
          />
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
