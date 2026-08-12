<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'

import { useComboboxNavigation } from '@feugene/granularity/composables/useComboboxNavigation'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import { dayPeriodNames } from '../../chrono/chronoFormat'
import type { PlainTime } from '../../chrono/plainTime'
import { plainTime } from '../../chrono/plainTime'
import type { TimeColumn, TimeOption, TimeUnit } from '../../chrono/timeColumns'
import { applyTimeUnit, buildTimeColumns } from '../../chrono/timeColumns'

import type { GrTimePickerSize } from './grTimePickerStyles'
import {
  timeColumnClass,
  timeColumnLabelClass,
  timeOptionClass,
  timePanelClass,
} from './grTimePickerStyles'

/**
 * Колонки времени — начинка панели, общая для `GrTimePicker` и
 * `GrDateTimePicker`.
 *
 * Не публичный компонент пакета: у него нет ни поля, ни оболочки, а модель —
 * внутренний кортеж `PlainTime`. Публичная граница с `Date` живёт в пикерах,
 * и заводить второе место, где она проходит, незачем.
 *
 * Каждая колонка — самостоятельный листбокс со своим `aria-activedescendant`,
 * как в `GrSelect`.
 */
export interface TimeColumnsProps {
  modelValue: PlainTime | null
  min?: PlainTime
  max?: PlainTime
  minuteStep?: number
  secondStep?: number
  enableSeconds?: boolean
  twelveHour?: boolean
  locale: string
  size: GrTimePickerSize
  /** Ввод не принимается: `disabled` или `readonly` у пикера. */
  locked?: boolean
  /** Открыта ли панель — от этого зависит существование `aria-activedescendant`. */
  open?: boolean
}

const props = withDefaults(defineProps<TimeColumnsProps>(), {
  min: undefined,
  max: undefined,
  minuteStep: 1,
  secondStep: 1,
  enableSeconds: false,
  twelveHour: false,
  locked: false,
  open: true,
})

const emit = defineEmits<{ (e: 'update:modelValue', value: PlainTime): void }>()

const { t } = useGranularityTranslations()

const columns = computed(() => buildTimeColumns({
  value: props.modelValue,
  min: props.min,
  max: props.max,
  minuteStep: props.minuteStep,
  secondStep: props.secondStep,
  enableSeconds: props.enableSeconds,
  twelveHour: props.twelveHour,
  periodLabels: dayPeriodNames(props.locale),
}))

function columnOf(unit: TimeUnit): TimeColumn | undefined {
  return columns.value.find(column => column.unit === unit)
}

const panelId = useId()
const columnEls = ref(new Map<TimeUnit, HTMLElement>())
const optionEls = ref(new Map<string, HTMLElement>())

function setColumnEl(unit: TimeUnit, element: unknown): void {
  if (element instanceof HTMLElement) columnEls.value.set(unit, element)
  else columnEls.value.delete(unit)
}

function setOptionEl(key: string, element: unknown): void {
  if (element instanceof HTMLElement) optionEls.value.set(key, element)
  else optionEls.value.delete(key)
}

function optionDomId(option: TimeOption): string {
  return `${panelId}-${option.key}`
}

/**
 * Навигация каждой колонки — свой экземпляр примитива: их число зависит от
 * пропов, а композаблы создаются один раз в `setup`, поэтому все четыре
 * заводятся всегда, а пустые просто не рендерятся.
 *
 * Запрещённые опции из обхода **не** выпадают: у них `aria-disabled`, и прыжок
 * через них молча поменял бы семантику стрелок — то же решение, что в сетке
 * календаря.
 */
function createNavigation(unit: TimeUnit) {
  return useComboboxNavigation<TimeOption>({
    items: () => columnOf(unit)?.options ?? [],
    open: () => props.open,
    idOf: option => optionDomId(option),
    initialIndex: () => Math.max(columnOf(unit)?.selectedIndex ?? -1, 0),
    scrollTo: (option) => {
      // В jsdom метода нет, и это не повод падать: прокрутка — оформление.
      optionEls.value.get(option.key)?.scrollIntoView?.({ block: 'nearest' })
    },
  })
}

const navigation = {
  hour: createNavigation('hour'),
  minute: createNavigation('minute'),
  second: createNavigation('second'),
  period: createNavigation('period'),
} as const

/**
 * Курсор ставится на выбранные значения, как только колонки на экране.
 *
 * Не в `focus()`: в `inline` панель никто не открывает и фокус в неё не уводит,
 * а `aria-activedescendant` обязан существовать всё равно — иначе клавиатура
 * для скринридера молчит.
 */
watch(() => props.open, (open) => {
  if (open) initNavigation()
}, { immediate: true })

function initNavigation(): void {
  for (const nav of Object.values(navigation)) nav.init()
}

function select(unit: TimeUnit, option: TimeOption): void {
  if (props.locked || option.disabled) return

  const base = props.modelValue ?? plainTime(0, 0, 0)
  emit('update:modelValue', applyTimeUnit(base, unit, option.value, props.twelveHour))
}

function onOptionClick(unit: TimeUnit, option: TimeOption, index: number): void {
  select(unit, option)
  navigation[unit].setActive(index)
}

function onColumnKeydown(unit: TimeUnit, event: KeyboardEvent): void {
  if (props.locked) return
  if (navigation[unit].handleNavigationKeys(event)) return

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const option = navigation[unit].activeItem.value
    if (option) select(unit, option)
  }
}

const columnLabels: Record<TimeUnit, [string, string]> = {
  hour: ['gr.timePicker.hours', 'Hours'],
  minute: ['gr.timePicker.minutes', 'Minutes'],
  second: ['gr.timePicker.seconds', 'Seconds'],
  period: ['gr.timePicker.period', 'AM/PM'],
}

function columnLabel(unit: TimeUnit): string {
  const [key, fallback] = columnLabels[unit]
  return t(key, fallback)
}

/** Поставить курсор на выбранные значения и увести фокус в первую колонку. */
function focus(): void {
  initNavigation()
  columnEls.value.get('hour')?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div data-gr-time-columns :class="timePanelClass">
    <div v-for="column in columns" :key="column.unit" data-gr-time-picker-column>
      <div :class="timeColumnLabelClass" aria-hidden="true">
        {{ columnLabel(column.unit) }}
      </div>

      <!-- Колонка скроллится, поэтому обязана быть достижима с клавиатуры. -->
      <div
        :ref="element => setColumnEl(column.unit, element)"
        role="listbox"
        tabindex="0"
        :data-unit="column.unit"
        :class="timeColumnClass"
        :aria-label="columnLabel(column.unit)"
        :aria-activedescendant="navigation[column.unit].activeDescendantId.value"
        @keydown="onColumnKeydown(column.unit, $event)"
      >
        <div
          v-for="(option, index) in column.options"
          :id="optionDomId(option)"
          :key="option.key"
          :ref="element => setOptionEl(option.key, element)"
          role="option"
          data-gr-time-picker-option
          :data-key="option.key"
          :aria-selected="index === column.selectedIndex ? 'true' : 'false'"
          :aria-disabled="option.disabled ? 'true' : undefined"
          :class="timeOptionClass({
            size,
            selected: index === column.selectedIndex,
            active: navigation[column.unit].activeIndex.value === index,
            disabled: option.disabled,
          })"
          @click="onOptionClick(column.unit, option, index)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>
  </div>
</template>
