<script setup lang="ts" generic="TItem = Date">
import { computed, ref, watch } from 'vue'

import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { CalendarCell, DisabledDatesInput } from '../../chrono/calendarGrid'
import { formatPlainDate } from '../../chrono/chronoFormat'
import type { GrChronoAdapter, GrChronoAdapterName } from '../../chrono/chronoModel'
import { fromPlainParts, resolveChronoAdapter, toPlainDate } from '../../chrono/chronoModel'
import type { IsoWeekday, PlainDate } from '../../chrono/plainDate'
import { comparePlainDates, differenceInDays } from '../../chrono/plainDate'
import {
  clearButtonClass,
  iconClass,
  indicatorClass,
  pickerFieldClass,
  spinnerClass,
  trailingZoneClass,
} from '../../internal/pickerFieldStyles'
import PickerSurface from '../../internal/PickerSurface.vue'
import { rangeCodec, usePickerShell } from '../../internal/usePickerShell'
import GrCalendar from '../GrCalendar/GrCalendar.vue'

import type { GrDateRangePickerSize } from './grDateRangePickerStyles'

/**
 * GrDateRangePicker — выбор периода одной сеткой.
 *
 * Диапазон набирается двумя кликами: первый ставит начало, второй закрывает
 * период и отдаёт его наружу. Пока период открыт, сетка показывает
 * предпросмотр до дня под курсором — и считается он **на отрисовке**,
 * сравнением кортежей: ячейки про выбор ничего не знают, иначе движение мыши
 * пересобирало бы всю сетку на каждый кадр.
 *
 * Границы можно вести и назад — порядок нормализуется при закрытии периода.
 */
export interface GrDateRangePickerProps<T = Date> {
  /** Обе границы или ничего: полупустой диапазон значением не считается. */
  modelValue?: readonly [T, T] | null
  /**
   * Как границы уходят наружу и приходят обратно. Адаптер применяется к каждой
   * отдельно, поэтому модель — пара `[T, T]`.
   */
  valueAdapter?: GrChronoAdapterName | GrChronoAdapter<T>
  min?: Date
  max?: Date
  /** Запрещённые даты: список или предикат. */
  disabledDates?: readonly Date[] | ((date: Date) => boolean)
  /** Наименьшая длина периода в днях, считая обе границы. */
  minRange?: number
  /** Наибольшая длина периода в днях, считая обе границы. */
  maxRange?: number
  weekStart?: IsoWeekday
  showWeekNumbers?: boolean
  /** Что считать сегодняшним днём. Задаётся ради воспроизводимых тестов. */
  today?: Date
  /** Вид границ в поле — опциями `Intl`, а не строкой-паттерном. */
  format?: Intl.DateTimeFormatOptions
  /** Разделитель границ в поле. */
  separator?: string
  placeholder?: string
  clearable?: boolean
  /** Контролируемое состояние панели (`v-model:open`). */
  open?: boolean
  /**
   * Панель рисуется на месте: ни поля, ни поповера. Модель, адаптер и `name`
   * остаются пикеровскими — этим `inline` и отличается от голого `GrCalendar`,
   * который говорит кортежами.
   */
  inline?: boolean
  placement?: UseFloatingPlacement
  teleportTo?: string | HTMLElement
  size?: GrDateRangePickerSize
  /** Локаль показа. Не задана — из адаптера i18n приложения. */
  locale?: string
  /** Собственный `id` поля. Не задан — берётся из `GrFormField`. */
  id?: string
  /** Имя для нативной формы: границы уходят двумя скрытыми полями. */
  name?: string
  disabled?: boolean
  /** Значение видно, панель открывается, но выбор не меняется. */
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  loading?: boolean
  ariaLabel?: string
}

export interface GrDateRangePickerEmits<T = Date> {
  (e: 'update:modelValue', value: readonly [T, T] | null): void
  (e: 'change', value: readonly [T, T] | null): void
  (e: 'update:open', value: boolean): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrDateRangePickerProps<TItem>>(), {
  modelValue: undefined,
  valueAdapter: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  minRange: undefined,
  maxRange: undefined,
  weekStart: undefined,
  showWeekNumbers: false,
  today: undefined,
  format: undefined,
  separator: ' — ',
  placeholder: undefined,
  // Дефолты живут в резолвере: Vue подставил бы свои раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  clearable: undefined,
  open: undefined,
  inline: false,
  placement: undefined,
  teleportTo: undefined,
  size: undefined,
  locale: undefined,
  id: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  loading: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrDateRangePickerEmits<TItem>>()

defineSlots<{
  /** Своя ячейка дня вместо числа. */
  day?: (props: { cell: CalendarCell, selected: boolean }) => unknown
  /** Своя шапка сетки вместо заголовка и стрелок. */
  header?: (props: { title: string, goToPeriod: (delta: number) => void }) => unknown
  /** Своя ячейка шапки недели вместо сокращённого названия дня. */
  weekday?: (props: { label: string, full: string, isoWeekday: IsoWeekday }) => unknown
  /** Подвал панели. */
  footer?: () => unknown
}>()

const calendarRef = ref<InstanceType<typeof GrCalendar> | null>(null)

const { announce } = useAnnouncer()

/** Границы в объявлениях — полной датой: «12.08» на слух неотличимо от «12.03». */
const LONG_DATE: Intl.DateTimeFormatOptions = { dateStyle: 'long' }

const shell = usePickerShell<readonly [TItem, TItem] | null, [Date, Date]>({
  props: () => props,
  component: 'GrDateRangePicker',
  codec: () => rangeCodec(resolveChronoAdapter<TItem>(props.valueAdapter)),
  emit: {
    open: value => emit('update:open', value),
    model: (value) => {
      emit('update:modelValue', value)
      emit('change', value)
    },
    clear: () => emit('clear'),
  },
  focusPanel: () => calendarRef.value?.focus(),
})

const {
  t,
  resolvedSize,
  resolvedPlacement,
  resolvedLocale,
  isDisabled,
  isInvalid,
  isRequired,
  isReadonly,
  isLocked,
  inputId,
  describedBy,
  selected,
  formValues,
  panelOpen,
  hasBeenOpen,
  fieldEl,
  showClear,
} = shell

/** Начало незакрытого периода: есть, пока ждём второй клик. */
const anchor = ref<PlainDate | null>(null)
const hovered = ref<PlainDate | null>(null)

// Панель закрылась с незакрытым периодом — начало сбрасывается: показывать
// половину выбора при следующем открытии значит врать о состоянии.
watch(panelOpen, (next) => {
  if (!next) {
    anchor.value = null
    hovered.value = null
  }
})

const selectedRange = computed<[PlainDate, PlainDate] | null>(() => (
  selected.value ? [toPlainDate(selected.value[0]), toPlainDate(selected.value[1])] : null
))

const rangeStart = computed(() => anchor.value ?? selectedRange.value?.[0] ?? null)
const rangeEnd = computed(() => (anchor.value ? null : selectedRange.value?.[1] ?? null))

const minPlain = computed(() => (props.min ? toPlainDate(props.min) : undefined))
const maxPlain = computed(() => (props.max ? toPlainDate(props.max) : undefined))
const todayPlain = computed(() => (props.today ? toPlainDate(props.today) : undefined))

const disabledDates = computed<DisabledDatesInput>(() => {
  const source = props.disabledDates
  if (!source) return undefined
  if (typeof source === 'function') return (date: PlainDate) => source(fromPlainParts(date))

  return source.map(toPlainDate)
})

const displayValue = computed(() => {
  const range = selectedRange.value
  if (!range) return ''

  const [from, to] = range
  return [
    formatPlainDate(resolvedLocale.value, from, props.format),
    formatPlainDate(resolvedLocale.value, to, props.format),
  ].join(props.separator)
})

/** Длина периода в днях, считая обе границы: 12–12 августа — это один день. */
function lengthOf(from: PlainDate, to: PlainDate): number {
  return Math.abs(differenceInDays(to, from)) + 1
}

function isLengthAllowed(from: PlainDate, to: PlainDate): boolean {
  const length = lengthOf(from, to)

  if (props.minRange !== undefined && length < props.minRange) return false
  if (props.maxRange !== undefined && length > props.maxRange) return false

  return true
}

function onDaySelect(date: PlainDate): void {
  if (isLocked.value) return

  // Первый клик открывает период, второй закрывает. Клик по началу открытого
  // периода — тоже второй: период в один день допустим, если длина позволяет.
  if (!anchor.value) {
    anchor.value = date
    hovered.value = date

    // Первый клик ничего видимого не выбирает — только открывает период, и без
    // объявления незрячий пользователь не понимает, что ждут второго дня.
    announce(t('gr.dateRangePicker.startSelected', 'Start date selected: {date}. Choose the end date', {
      date: formatPlainDate(resolvedLocale.value, date, LONG_DATE),
    }))
    return
  }

  const [from, to] = comparePlainDates(anchor.value, date) <= 0
    ? [anchor.value, date]
    : [date, anchor.value]

  // Слишком короткий или слишком длинный период не выбирается, но и не
  // сбрасывает начало: пользователь просто промахнулся мимо допустимой длины.
  if (!isLengthAllowed(from, to)) {
    announce(t('gr.dateRangePicker.lengthRejected', 'This range length is not allowed'))
    return
  }

  shell.commit([fromPlainParts(from), fromPlainParts(to)])
  announce(t('gr.dateRangePicker.rangeSelected', 'Range selected: {from} — {to}', {
    from: formatPlainDate(resolvedLocale.value, from, LONG_DATE),
    to: formatPlainDate(resolvedLocale.value, to, LONG_DATE),
  }))
  anchor.value = null
  hovered.value = null

  // Фокус на поле вернёт стек слоёв: на момент закрытия он ещё внутри панели.
  shell.closePanel()
}

function onDayHover(date: PlainDate | null): void {
  if (!anchor.value) return

  hovered.value = date
}

defineExpose({
  focus: shell.focus,
  blur: shell.blur,
  open: shell.openPanel,
  close: shell.closePanel,
})

const fieldClass = computed(() => pickerFieldClass({
  size: resolvedSize.value,
  disabled: isDisabled.value,
  invalid: isInvalid.value,
}))

/**
 * Панель отдаёт свои фон и отступ, а календарь внутри неё — нет: две подложки
 * с двойным паддингом выглядели бы как рамка внутри рамки.
 */
const calendarVars = { '--gr-calendar-bg': 'transparent', '--gr-calendar-padding': '0' }
</script>

<template>
  <div data-gr-date-range-picker>
    <!-- Границы уходят двумя полями с одним именем: так их читает
         `FormData.getAll`, и так же ведут себя нативные множественные поля. -->
    <template v-if="name">
      <input v-for="(value, index) in formValues" :key="index" type="hidden" :name="name" :value="value">
    </template>

    <PickerSurface
      :inline="inline"
      :open="panelOpen"
      :size="resolvedSize"
      :placement="resolvedPlacement"
      :disabled="isDisabled"
      :teleport-to="teleportTo"
      :panel-label="t('gr.dateRangePicker.panelLabel', 'Choose date range')"
      @update:open="panelOpen = $event"
    >
      <template v-if="!inline" #trigger="{ triggerProps }">
        <div class="relative">
          <input
            :id="inputId"
            ref="fieldEl"
            v-bind="triggerProps"
            data-gr-date-range-picker-field
            type="text"
            role="combobox"
            readonly
            aria-readonly="true"
            :value="displayValue"
            :placeholder="placeholder"
            :class="fieldClass"
            :disabled="isDisabled"
            :aria-label="ariaLabel"
            :aria-describedby="describedBy"
            :aria-invalid="isInvalid ? 'true' : undefined"
            :aria-required="isRequired ? 'true' : undefined"
            :aria-busy="loading ? 'true' : undefined"
            @click="shell.togglePanel"
            @keydown="shell.onFieldKeydown"
            @focus="emit('focus', $event)"
            @blur="emit('blur', $event)"
          >

          <span :class="trailingZoneClass">
            <span v-if="loading" data-gr-date-range-picker-spinner aria-hidden="true">
              <svg :class="spinnerClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.2-8.6" stroke-linecap="round" />
              </svg>
            </span>

            <button
              v-else-if="showClear"
              data-gr-date-range-picker-clear
              type="button"
              :class="clearButtonClass"
              :aria-label="t('gr.common.clear', 'Clear')"
              @click.stop="shell.clear"
            >
              <svg :class="iconClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>

            <span v-else data-gr-date-range-picker-indicator :class="indicatorClass" aria-hidden="true">
              <svg :class="iconClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 11h18M7 15h4" stroke-linecap="round" />
              </svg>
            </span>
          </span>
        </div>
      </template>

      <div v-if="hasBeenOpen" data-gr-date-range-picker-panel :style="calendarVars">
          <GrCalendar
            ref="calendarRef"
            :model-value="null"
            :announce-selection="false"
            :range-start="rangeStart"
            :range-end="rangeEnd"
            :range-preview="hovered"
            :min="minPlain"
            :max="maxPlain"
            :disabled-dates="disabledDates"
            :week-start="weekStart"
            :show-week-numbers="showWeekNumbers"
            :today="todayPlain"
            :locale="locale"
            :size="resolvedSize"
            :readonly="isReadonly"
            :aria-label="ariaLabel ?? t('gr.datePicker.gridLabel', 'Calendar')"
            @update:model-value="onDaySelect"
            @day-hover="onDayHover"
          >
            <template v-if="$slots.day" #day="slotProps">
              <slot name="day" v-bind="slotProps" />
            </template>
            <template v-if="$slots.header" #header="slotProps">
              <slot name="header" v-bind="slotProps" />
            </template>
            <template v-if="$slots.weekday" #weekday="slotProps">
              <slot name="weekday" v-bind="slotProps" />
            </template>
            <template v-if="$slots.footer" #footer>
              <slot name="footer" />
            </template>
          </GrCalendar>
        </div>
    </PickerSurface>
  </div>
</template>
