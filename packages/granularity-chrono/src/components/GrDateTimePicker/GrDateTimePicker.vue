<script setup lang="ts" generic="TValue = Date | null">
import { computed, ref, watch } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { CalendarCell, DisabledDatesInput } from '../../chrono/calendarGrid'
import { formatPlainDate, formatPlainTime, localeUsesTwelveHour } from '../../chrono/chronoFormat'
import type { GrChronoAdapter, GrChronoAdapterName } from '../../chrono/chronoModel'
import { fromPlainParts, resolveChronoAdapter, toPlainDate, toPlainTime } from '../../chrono/chronoModel'
import type { IsoWeekday, PlainDate } from '../../chrono/plainDate'
import type { PlainTime } from '../../chrono/plainTime'
import { plainTime } from '../../chrono/plainTime'
import {
  clearButtonClass,
  iconClass,
  indicatorClass,
  pickerFieldClass,
  spinnerClass,
  trailingZoneClass,
} from '../../internal/pickerFieldStyles'
import PickerSurface from '../../internal/PickerSurface.vue'
import { dateCodec, usePickerShell } from '../../internal/usePickerShell'
import GrCalendar from '../GrCalendar/GrCalendar.vue'
import TimeColumns from '../GrTimePicker/TimeColumns.vue'

import type { GrDateTimePickerSize } from './grDateTimePickerStyles'
import {
  dateTimeFooterClass,
  dateTimePanelClass,
  dateTimeTimeClass,
} from './grDateTimePickerStyles'

/**
 * GrDateTimePicker — дата и время в одной панели.
 *
 * Здесь впервые появляется `autoApply`: выбор становится многошаговым — день,
 * час, минута, — и «применить» перестаёт быть тавтологией. При `autoApply`
 * каждый шаг уходит наружу сразу, иначе панель правит черновик, а модель
 * меняется только кнопкой.
 *
 * У `GrDatePicker` такого пропа нет намеренно: выбор даты атомарен, и
 * подтверждать там нечего.
 */
export interface GrDateTimePickerProps<T = Date | null> {
  modelValue?: T
  /**
   * Как значение уходит наружу и приходит обратно: имя готового адаптера
   * (`date`, `isoDate`, `isoDateTime`, `timestamp`) либо свой.
   */
  valueAdapter?: GrChronoAdapterName | GrChronoAdapter<T>
  /** Нижняя граница: дата — сеткой, время — колонками. */
  min?: Date
  /** Верхняя граница. */
  max?: Date
  /** Запрещённые даты: список или предикат. */
  disabledDates?: readonly Date[] | ((date: Date) => boolean)
  weekStart?: IsoWeekday
  showWeekNumbers?: boolean
  minuteStep?: number
  secondStep?: number
  enableSeconds?: boolean
  /** 12-часовой вид колонок. Не задан — из локали через `Intl`. */
  use12Hours?: boolean
  /**
   * Каждый шаг уходит наружу сразу. `false` — панель правит черновик, а модель
   * меняется кнопкой подтверждения.
   */
  autoApply?: boolean
  /** Что считать сегодняшним днём. Задаётся ради воспроизводимых тестов. */
  today?: Date
  /** Вид значения в поле — опциями `Intl`, а не строкой-паттерном. */
  format?: Intl.DateTimeFormatOptions
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
  size?: GrDateTimePickerSize
  /** Локаль показа. Не задана — из адаптера i18n приложения. */
  locale?: string
  /** Собственный `id` поля. Не задан — берётся из `GrFormField`. */
  id?: string
  /** Имя для нативной формы: сериализованное значение уходит скрытым полем. */
  name?: string
  disabled?: boolean
  /** Значение видно, панель открывается, но выбор не меняется. */
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  loading?: boolean
  ariaLabel?: string
}

export interface GrDateTimePickerEmits<T = Date | null> {
  (e: 'update:modelValue', value: T | null): void
  (e: 'change', value: T | null): void
  (e: 'update:open', value: boolean): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrDateTimePickerProps<TValue>>(), {
  modelValue: undefined,
  valueAdapter: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  weekStart: undefined,
  showWeekNumbers: false,
  minuteStep: 1,
  secondStep: 1,
  enableSeconds: false,
  use12Hours: undefined,
  autoApply: true,
  today: undefined,
  format: undefined,
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

const emit = defineEmits<GrDateTimePickerEmits<TValue>>()

defineSlots<{
  /** Своя ячейка дня вместо числа. */
  day?: (props: { cell: CalendarCell, selected: boolean }) => unknown
  /** Своя шапка сетки вместо заголовка и стрелок. */
  header?: (props: { title: string, goToPeriod: (delta: number) => void }) => unknown
  /** Подвал панели вместо кнопок подтверждения. */
  footer?: (props: { apply: () => void, cancel: () => void }) => unknown
}>()

const calendarRef = ref<InstanceType<typeof GrCalendar> | null>(null)

const shell = usePickerShell<TValue>({
  props: () => props,
  codec: () => dateCodec(resolveChronoAdapter<TValue>(props.valueAdapter)),
  component: 'GrDateTimePicker',
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
  selected: selectedDate,
  formValues,
  panelOpen,
  panelVisible,
  hasBeenOpen,
  fieldEl,
  showClear,
} = shell

const twelveHour = computed(() => props.use12Hours ?? localeUsesTwelveHour(resolvedLocale.value))

/**
 * Черновик панели.
 *
 * При `autoApply` его нет вовсе: панель показывает модель и правит её напрямую.
 * Без него черновик заводится на открытии — иначе «Отмена» было бы нечего
 * отменять, — и живёт до подтверждения.
 */
const draft = ref<Date | null>(null)

const shown = computed(() => (props.autoApply ? selectedDate.value : draft.value))

// `panelVisible`, а не `panelOpen`: в `inline` панель на экране с монтирования,
// и черновику неоткуда взяться, если ждать открытия.
watch(panelVisible, (next) => {
  if (next && !props.autoApply) draft.value = selectedDate.value
}, { immediate: true })

const shownDate = computed<PlainDate | null>(() => (shown.value ? toPlainDate(shown.value) : null))
const shownTime = computed<PlainTime | null>(() => (shown.value ? toPlainTime(shown.value) : null))

const minPlain = computed(() => (props.min ? toPlainDate(props.min) : undefined))
const maxPlain = computed(() => (props.max ? toPlainDate(props.max) : undefined))
const todayPlain = computed(() => (props.today ? toPlainDate(props.today) : undefined))

/**
 * Границы времени работают только внутри граничного дня: 09:00–18:00 у
 * `min = 2026-08-12T09:00` осмысленно 12 августа, а 13-го запрещало бы утро
 * без всякой причины.
 */
const timeBounds = computed(() => {
  const date = shownDate.value

  const at = (bound: Date | undefined): PlainTime | undefined => {
    if (!bound || !date) return undefined
    const boundDate = toPlainDate(bound)

    return boundDate.y === date.y && boundDate.m === date.m && boundDate.d === date.d
      ? toPlainTime(bound)
      : undefined
  }

  return { min: at(props.min), max: at(props.max) }
})

/**
 * Запреты приходят в `Date`, а сетка спрашивает кортежами. Предикат
 * оборачивается, а не переписывается: обратный перевод стоит одного объекта на
 * ячейку при смене месяца.
 */
const disabledDates = computed<DisabledDatesInput>(() => {
  const source = props.disabledDates
  if (!source) return undefined
  if (typeof source === 'function') return (date: PlainDate) => source(fromPlainParts(date))

  return source.map(toPlainDate)
})

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  if (props.format) {
    return formatPlainDate(resolvedLocale.value, toPlainDate(selectedDate.value), props.format)
  }

  const date = formatPlainDate(resolvedLocale.value, toPlainDate(selectedDate.value))
  const time = formatPlainTime(resolvedLocale.value, toPlainTime(selectedDate.value), {
    hour: twelveHour.value ? 'numeric' : '2-digit',
    minute: '2-digit',
    ...(props.enableSeconds ? { second: '2-digit' } : {}),
    hour12: twelveHour.value,
  })

  return `${date}, ${time}`
})

/** Новое значение: либо наружу, либо в черновик — по `autoApply`. */
function put(date: Date): void {
  if (isLocked.value) return

  if (props.autoApply) shell.commit(date)
  else draft.value = date
}

function onDateChange(date: PlainDate): void {
  put(fromPlainParts(date, shownTime.value ?? plainTime(0, 0, 0)))
}

function onTimeChange(time: PlainTime): void {
  const date = shownDate.value ?? toPlainDate(props.today ?? new Date())
  put(fromPlainParts(date, time))
}

function apply(): void {
  if (draft.value) shell.commit(draft.value)
  shell.closePanel()
}

function cancel(): void {
  draft.value = selectedDate.value
  shell.closePanel()
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
  <div data-gr-date-time-picker>
    <!-- Форме уходит сериализованное значение, а не видимый текст: показ
         локале-зависим и на сервере не разбирается. -->
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
      :panel-label="t('gr.dateTimePicker.panelLabel', 'Choose date and time')"
      @update:open="panelOpen = $event"
    >
      <template v-if="!inline" #trigger="{ triggerProps }">
        <div class="relative">
          <input
            :id="inputId"
            ref="fieldEl"
            v-bind="triggerProps"
            data-gr-date-time-picker-field
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
            <span v-if="loading" data-gr-date-time-picker-spinner aria-hidden="true">
              <svg :class="spinnerClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.2-8.6" stroke-linecap="round" />
              </svg>
            </span>

            <button
              v-else-if="showClear"
              data-gr-date-time-picker-clear
              type="button"
              :class="clearButtonClass"
              :aria-label="t('gr.common.clear', 'Clear')"
              @click.stop="shell.clear"
            >
              <svg :class="iconClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>

            <span v-else data-gr-date-time-picker-indicator :class="indicatorClass" aria-hidden="true">
              <svg :class="iconClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 11h18" stroke-linecap="round" />
                <path d="M12 14v3l2 1" stroke-linecap="round" />
              </svg>
            </span>
          </span>
        </div>
      </template>

      <div v-if="hasBeenOpen" data-gr-date-time-picker-panel :style="calendarVars">
          <div :class="dateTimePanelClass">
            <GrCalendar
              ref="calendarRef"
              :model-value="shownDate"
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
              @update:model-value="onDateChange"
            >
              <template v-if="$slots.day" #day="slotProps">
                <slot name="day" v-bind="slotProps" />
              </template>
              <template v-if="$slots.header" #header="slotProps">
                <slot name="header" v-bind="slotProps" />
              </template>
            </GrCalendar>

            <div :class="dateTimeTimeClass">
              <TimeColumns
              :model-value="shownTime"
              :min="timeBounds.min"
              :max="timeBounds.max"
              :minute-step="minuteStep"
              :second-step="secondStep"
              :enable-seconds="enableSeconds"
              :twelve-hour="twelveHour"
              :locale="resolvedLocale"
              :size="resolvedSize"
                :locked="isLocked"
                :open="panelVisible"
                @update:model-value="onTimeChange"
              />
            </div>
          </div>

          <slot name="footer" :apply="apply" :cancel="cancel">
            <div v-if="!autoApply" :class="dateTimeFooterClass" data-gr-date-time-picker-footer>
              <GrButton
                data-gr-date-time-picker-cancel
                variant="ghost"
                :size="resolvedSize"
                @click="cancel"
              >
                {{ t('gr.dateTimePicker.cancel', 'Cancel') }}
              </GrButton>

              <GrButton
                data-gr-date-time-picker-apply
                :size="resolvedSize"
                :disabled="isLocked"
                @click="apply"
              >
                {{ t('gr.dateTimePicker.apply', 'Apply') }}
              </GrButton>
            </div>
          </slot>
        </div>
    </PickerSurface>
  </div>
</template>
