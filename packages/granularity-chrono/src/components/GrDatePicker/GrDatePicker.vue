<script setup lang="ts" generic="TValue = Date | null">
import { computed, ref } from 'vue'

import GrPopover from '@feugene/granularity/components/GrPopover'
import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { CalendarCell, DisabledDatesInput } from '../../chrono/calendarGrid'
import { formatPlainDate } from '../../chrono/chronoFormat'
import type { GrChronoAdapter, GrChronoAdapterName } from '../../chrono/chronoModel'
import { fromPlainParts, toPlainDate } from '../../chrono/chronoModel'
import type { IsoWeekday, PlainDate } from '../../chrono/plainDate'
import {
  clearButtonClass,
  iconClass,
  indicatorClass,
  pickerFieldClass,
  spinnerClass,
  trailingZoneClass,
} from '../../internal/pickerFieldStyles'
import { usePickerShell } from '../../internal/usePickerShell'
import GrCalendar from '../GrCalendar/GrCalendar.vue'

import type { GrDatePickerSize } from './grDatePickerStyles'

/**
 * GrDatePicker — поле с датой и панелью-календарём.
 *
 * Границей между мирами служит именно этот компонент: наружу он говорит на
 * `Date` (или на том, что задаёт `valueAdapter`), внутрь — кортежами
 * `PlainDate`, на которых считает весь пакет.
 *
 * Ручного ввода текстом в этой версии нет, поэтому поле честно помечено
 * `readonly`: значение меняется только через панель.
 */
export interface GrDatePickerProps<T = Date | null> {
  modelValue?: T
  /**
   * Как значение уходит наружу и приходит обратно: имя готового адаптера
   * (`date`, `isoDate`, `isoDateTime`, `timestamp`) либо свой.
   *
   * Отдельным пропом, а не подменой типа модели: у предшественника фактический
   * тип задавала строка, и вывести его из типов было невозможно.
   */
  valueAdapter?: GrChronoAdapterName | GrChronoAdapter<T>
  min?: Date
  max?: Date
  /** Запрещённые даты: список или предикат. */
  disabledDates?: readonly Date[] | ((date: Date) => boolean)
  /** Первый день недели по ISO (1 — понедельник). Не задан — из локали. */
  weekStart?: IsoWeekday
  showWeekNumbers?: boolean
  /** Что считать сегодняшним днём. Задаётся ради воспроизводимых тестов и снимков. */
  today?: Date
  /** Локаль показа. Не задана — из адаптера i18n приложения. */
  locale?: string
  /**
   * Вид значения в поле — опциями `Intl`, а не строкой-паттерном: паттерн
   * пришлось бы разбирать самим и он всё равно не знает порядка частей в чужой
   * локали.
   */
  format?: Intl.DateTimeFormatOptions
  placeholder?: string
  clearable?: boolean
  /** Контролируемое состояние панели (`v-model:open`). */
  open?: boolean
  placement?: UseFloatingPlacement
  /** Точечное переопределение точки монтирования панели. */
  teleportTo?: string | HTMLElement
  size?: GrDatePickerSize
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

export interface GrDatePickerEmits<T = Date | null> {
  (e: 'update:modelValue', value: T | null): void
  (e: 'change', value: T | null): void
  (e: 'update:open', value: boolean): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrDatePickerProps<TValue>>(), {
  modelValue: undefined,
  valueAdapter: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  weekStart: undefined,
  showWeekNumbers: false,
  today: undefined,
  locale: undefined,
  format: undefined,
  placeholder: undefined,
  // Дефолты живут в резолвере: Vue подставил бы свои раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  clearable: undefined,
  open: undefined,
  placement: undefined,
  teleportTo: undefined,
  size: undefined,
  id: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  loading: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrDatePickerEmits<TValue>>()

defineSlots<{
  /** Своя ячейка дня вместо числа. */
  day?: (props: { cell: CalendarCell, selected: boolean }) => unknown
  /** Своя шапка панели вместо заголовка и стрелок. */
  header?: (props: { title: string, goToMonth: (delta: number) => void }) => unknown
  /** Подвал панели. */
  footer?: () => unknown
}>()

const calendarRef = ref<InstanceType<typeof GrCalendar> | null>(null)

const shell = usePickerShell<TValue>({
  props: () => props,
  component: 'GrDatePicker',
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
  inputId,
  describedBy,
  selectedDate,
  formValue,
  panelOpen,
  hasBeenOpen,
  fieldEl,
  showClear,
} = shell

const selected = computed<PlainDate | null>(() => (
  selectedDate.value ? toPlainDate(selectedDate.value) : null
))

const minPlain = computed(() => (props.min ? toPlainDate(props.min) : undefined))
const maxPlain = computed(() => (props.max ? toPlainDate(props.max) : undefined))
const todayPlain = computed(() => (props.today ? toPlainDate(props.today) : undefined))

/**
 * Запреты приходят в `Date`, а сетка спрашивает кортежами. Предикат
 * оборачивается, а не переписывается: обратный перевод стоит одного объекта на
 * ячейку при смене месяца — 42 за раз, и только когда предикат вообще задан.
 */
const disabledDates = computed<DisabledDatesInput>(() => {
  const source = props.disabledDates
  if (!source) return undefined
  if (typeof source === 'function') return (date: PlainDate) => source(fromPlainParts(date))

  return source.map(toPlainDate)
})

const displayValue = computed(() => (
  selected.value ? formatPlainDate(resolvedLocale.value, selected.value, props.format) : ''
))

function onSelect(date: PlainDate): void {
  // Гард здесь, а не только в `commit`: закрытая по клику панель выглядела бы
  // так, будто выбор состоялся.
  if (shell.isLocked.value) return

  shell.commit(fromPlainParts(date))

  // Фокус на поле вернёт стек слоёв: на момент закрытия он ещё внутри панели.
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
 * с двойным паддингом выглядели бы как рамка внутри рамки. Гасится хуками
 * самого календаря, ради которых они и заведены.
 */
const calendarVars = { '--gr-calendar-bg': 'transparent', '--gr-calendar-padding': '0' }
</script>

<template>
  <div data-gr-date-picker>
    <!-- Форме уходит сериализованное значение, а не видимый текст: показ
         локале-зависим и на сервере не разбирается. -->
    <input v-if="name" type="hidden" :name="name" :value="formValue">

    <GrPopover
      v-model:open="panelOpen"
      :size="resolvedSize"
      :placement="resolvedPlacement"
      :disabled="isDisabled"
      :teleport-to="teleportTo"
      :aria-label="t('gr.datePicker.panelLabel', 'Choose date')"
      :close-on-content-click="false"
      trigger="manual"
      :auto-focus="false"
    >
      <template #trigger="{ triggerProps }">
        <div class="relative">
          <input
            :id="inputId"
            ref="fieldEl"
            v-bind="triggerProps"
            data-gr-date-picker-field
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
            <span v-if="loading" data-gr-date-picker-spinner aria-hidden="true">
              <svg :class="spinnerClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.2-8.6" stroke-linecap="round" />
              </svg>
            </span>

            <button
              v-else-if="showClear"
              data-gr-date-picker-clear
              type="button"
              :class="clearButtonClass"
              :aria-label="t('gr.common.clear', 'Clear')"
              @click.stop="shell.clear"
            >
              <svg :class="iconClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>

            <span v-else data-gr-date-picker-indicator :class="indicatorClass" aria-hidden="true">
              <svg :class="iconClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 11h18" stroke-linecap="round" />
              </svg>
            </span>
          </span>
        </div>
      </template>

      <template #content>
        <div v-if="hasBeenOpen" data-gr-date-picker-panel :style="calendarVars">
          <GrCalendar
            ref="calendarRef"
            :model-value="selected"
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
            @update:model-value="onSelect"
          >
            <template v-if="$slots.day" #day="slotProps">
              <slot name="day" v-bind="slotProps" />
            </template>
            <template v-if="$slots.header" #header="slotProps">
              <slot name="header" v-bind="slotProps" />
            </template>
            <template v-if="$slots.footer" #footer>
              <slot name="footer" />
            </template>
          </GrCalendar>
        </div>
      </template>
    </GrPopover>
  </div>
</template>
