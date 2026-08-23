<script setup lang="ts" generic="TValue = Date | null">
import { computed, ref } from 'vue'

import { titleWhenTruncated } from '@feugene/granularity'
import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import { formatPlainTime, localeUsesTwelveHour } from '../../chrono/chronoFormat'
import { parseLocaleTime, parsePartialLocaleTime } from '../../chrono/chronoParse'
import type { GrChronoAdapter, GrChronoAdapterName } from '../../chrono/chronoModel'
import { clockDate, fromPlainParts, resolveChronoAdapter, toPlainDate, toPlainTime } from '../../chrono/chronoModel'
import type { PlainDate } from '../../chrono/plainDate'
import type { PlainTime } from '../../chrono/plainTime'
import { ceilToStep, isPlainTimeWithin } from '../../chrono/plainTime'
import {
  clearButtonClass,
  iconClass,
  indicatorClass,
  pickerFieldClass,
  spinnerClass,
  trailingZoneClass,
} from '../../internal/pickerFieldStyles'
import PickerSurface from '../../internal/PickerSurface.vue'
import { useEditableField } from '../../internal/useEditableField'
import { presetRowClass } from '../../internal/presetRowStyles'
import { dateCodec, usePickerShell } from '../../internal/usePickerShell'

import type { GrTimePickerSize } from './grTimePickerStyles'
import TimeColumns from './TimeColumns.vue'

/**
 * GrTimePicker — поле со временем и панелью из колонок.
 *
 * Колонки, а не поля ввода: набирать «14:30» с клавиатуры — это текстовый ввод,
 * который в этой версии пакета не поддерживается вовсе, а листать значения
 * стрелками можно и здесь. Каждая колонка — самостоятельный листбокс со своим
 * `aria-activedescendant`, как в `GrSelect`.
 *
 * Панель по выбору **не закрывается**: время набирается за несколько шагов —
 * час, минута, иногда секунда и период. Закрытие остаётся за Esc, кликом вне и
 * `v-model:open`.
 */
export interface GrTimePickerProps<T = Date | null> {
  modelValue?: T
  /**
   * Как значение уходит наружу и приходит обратно: имя готового адаптера
   * (`date`, `isoDate`, `isoDateTime`, `timestamp`) либо свой.
   */
  valueAdapter?: GrChronoAdapterName | GrChronoAdapter<T>
  /** Нижняя граница. Учитывается только время суток. */
  min?: Date
  /** Верхняя граница. Учитывается только время суток. */
  max?: Date
  /** Шаг колонки минут в минутах. */
  minuteStep?: number
  /** Шаг колонки секунд в секундах. */
  secondStep?: number
  enableSeconds?: boolean
  /** 12-часовой вид. Не задан — из локали через `Intl`. */
  use12Hours?: boolean
  /**
   * Дата, к которой привязывается выбранное время, когда значения ещё нет.
   * Задаётся ради воспроизводимых тестов и снимков.
   */
  today?: Date
  /** Вид значения в поле — опциями `Intl`, а не строкой-паттерном. */
  format?: Intl.DateTimeFormatOptions
  placeholder?: string
  /**
   * Время можно набрать руками: `9:30`, `09:30:45`, `3:30 PM`. Маски здесь нет
   * намеренно — разделитель у времени один, и дорисовывать нечего.
   */
  editable?: boolean
  /** Разобранный текст уходит наружу на уходе фокуса, а не только по `Enter`. */
  applyOnBlur?: boolean
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
  size?: GrTimePickerSize
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

export interface GrTimePickerEmits<T = Date | null> {
  (e: 'update:modelValue', value: T | null): void
  (e: 'change', value: T | null): void
  (e: 'update:open', value: boolean): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrTimePickerProps<TValue>>(), {
  modelValue: undefined,
  valueAdapter: undefined,
  min: undefined,
  max: undefined,
  minuteStep: 1,
  secondStep: 1,
  enableSeconds: false,
  use12Hours: undefined,
  today: undefined,
  format: undefined,
  placeholder: undefined,
  editable: false,
  applyOnBlur: true,
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

const emit = defineEmits<GrTimePickerEmits<TValue>>()

defineSlots<{
  /**
   * Подвал панели: «сейчас», «очистить».
   *
   * Выбор отдаётся внутрь, как у пикеров дат: запрет складывается из `min`,
   * `max` и шага, а `readonly` запрещает выбор целиком — снаружи этих правил
   * не видно.
   */
  footer?: (props: {
    select: (date: Date) => boolean
    canSelect: (date: Date) => boolean
    close: () => void
  }) => unknown
}>()

const columnsRef = ref<InstanceType<typeof TimeColumns> | null>(null)

const shell = usePickerShell<TValue>({
  props: () => props,
  codec: () => dateCodec(resolveChronoAdapter<TValue>(props.valueAdapter)),
  component: 'GrTimePicker',
  emit: {
    open: value => emit('update:open', value),
    model: (value) => {
      emit('update:modelValue', value)
      emit('change', value)
    },
    clear: () => emit('clear'),
  },
  focusPanel: () => columnsRef.value?.focus(),
})

const {
  t,
  resolvedSize,
  resolvedPlacement,
  resolvedLocale,
  isDisabled,
  isInvalid,
  isRequired,
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

const selectedTime = computed<PlainTime | null>(() => (
  selectedDate.value ? toPlainTime(selectedDate.value) : null
))

const minTime = computed(() => (props.min ? toPlainTime(props.min) : undefined))
const maxTime = computed(() => (props.max ? toPlainTime(props.max) : undefined))

const displayValue = computed(() => {
  if (!selectedTime.value)
    return ''

  // `timeStyle` тут не годится: он берёт 12/24 из локали и проп `use12Hours`
  // молча игнорирует — поле показывало бы одно, а колонки другое.
  return formatPlainTime(resolvedLocale.value, selectedTime.value, props.format ?? {
    hour: twelveHour.value ? 'numeric' : '2-digit',
    minute: '2-digit',
    ...(props.enableSeconds ? { second: '2-digit' } : {}),
    hour12: twelveHour.value,
  })
})

/** Дата, к которой привязано время: своя у значения, иначе «сегодня». */
function anchorDate(): PlainDate {
  return selectedDate.value ? toPlainDate(selectedDate.value) : props.today ? toPlainDate(props.today) : clockDate()
}

const field = useEditableField({
  editable: () => props.editable,
  applyOnBlur: () => props.applyOnBlur,
  locked: () => shell.isLocked.value,
  display: () => displayValue.value,
  parse: (text) => {
    const parsed = parseLocaleTime(resolvedLocale.value, text)

    return parsed ? fromPlainParts(anchorDate(), parsed) : null
  },
  commit: date => shell.commit(date),
})

function onFieldKeydown(event: KeyboardEvent): void {
  if (field.handleKeydown(event))
    return

  shell.onFieldKeydown(event)
}

/**
 * Колонки идут за набором по частям: набран час — подсвечен час, минуты пока
 * остаются прежними. Не набранное не меняется, и модель ждёт `Enter`.
 */
const shownTime = computed<PlainTime | null>(() => {
  const draft = field.draft.value
  const typed = draft === null ? null : parsePartialLocaleTime(resolvedLocale.value, draft)
  if (!typed)
    return selectedTime.value

  const base = selectedTime.value

  return { h: typed.h ?? base?.h ?? 0, min: typed.min ?? base?.min ?? 0, s: typed.s ?? base?.s ?? 0 }
})
function onTimeChange(time: PlainTime): void {
  shell.commit(fromPlainParts(anchorDate(), time))
}

/**
 * Сетка, на которую встаёт время из подвала.
 *
 * Побеждает самая крупная объявленная ступень, а мелкие обнуляются: при шаге
 * в 15 минут «сейчас» обязано дать 14:45:00, а не 14:45:37. Секунды выключены
 * — в значении их тоже быть не должно, иначе в модель уедет то, чего на экране
 * не было.
 */
const nowStepSeconds = computed(() => {
  if (props.minuteStep > 1)
    return props.minuteStep * 60
  if (!props.enableSeconds)
    return 60

  return Math.max(1, props.secondStep)
})

/** Время из подвала, уже поставленное на сетку шага. */
function snapTime(date: Date): PlainTime {
  return ceilToStep(toPlainTime(date), nowStepSeconds.value)
}

/**
 * Подвал сетку колонок обходит, поэтому спрашивает явно; кнопка с недоступным
 * временем приходит выключенной, а не молча ничего не делает.
 *
 * Порядок обязателен: **сначала на сетку, потом границы.** При `max` в 14:40 и
 * шаге в 15 минут время 14:37 округляется до 14:45 — уже за границей, и кнопка
 * обязана погаснуть. Проверка до округления пропустила бы её.
 */
function canSelectTime(date: Date): boolean {
  if (shell.isLocked.value)
    return false

  return isPlainTimeWithin(snapTime(date), minTime.value, maxTime.value)
}

/** Выбор из подвала. Возвращает `false`, если время запрещено. */
function selectTime(date: Date): boolean {
  if (!canSelectTime(date))
    return false

  shell.commit(fromPlainParts(anchorDate(), snapTime(date)))
  shell.closePanel()

  return true
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
</script>

<template>
  <div data-gr-time-picker>
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
      :panel-label="t('grChrono.timePicker.panelLabel', 'Choose time')"
      @update:open="panelOpen = $event"
    >
      <template v-if="!inline" #trigger="{ triggerProps }">
        <div class="relative">
          <input
            :id="inputId"
            ref="fieldEl"
            v-bind="triggerProps"
            data-gr-time-picker-field
            type="text"
            role="combobox"
            :readonly="!editable"
            :aria-readonly="editable ? undefined : 'true'"
            :aria-autocomplete="editable ? 'none' : undefined"
            :value="field.text.value"
            :placeholder="placeholder"
            :class="fieldClass"
            :disabled="isDisabled"
            :aria-label="ariaLabel"
            :aria-describedby="describedBy"
            :aria-invalid="isInvalid ? 'true' : undefined"
            :aria-required="isRequired ? 'true' : undefined"
            :aria-busy="loading ? 'true' : undefined"
            @click="editable ? shell.openPanel(false) : shell.togglePanel()"
            @keydown="onFieldKeydown"
            @input="field.onInput"
            @focus="emit('focus', $event)"
            @pointerenter="titleWhenTruncated"
            @blur="field.onBlur(); emit('blur', $event)"
          >

          <span :class="trailingZoneClass">
            <span v-if="loading" data-gr-time-picker-spinner aria-hidden="true">
              <svg :class="spinnerClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.2-8.6" stroke-linecap="round" />
              </svg>
            </span>

            <button
              v-else-if="showClear"
              data-gr-time-picker-clear
              type="button"
              :class="clearButtonClass"
              :aria-label="t('gr.common.clear', 'Clear')"
              @click.stop="shell.clear"
            >
              <svg :class="iconClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>

            <span v-else data-gr-time-picker-indicator :class="indicatorClass" aria-hidden="true">
              <svg :class="iconClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" stroke-linecap="round" />
              </svg>
            </span>
          </span>
        </div>
      </template>

      <div v-if="hasBeenOpen" data-gr-time-picker-panel>
          <TimeColumns
            ref="columnsRef"
            :model-value="shownTime"
            :min="minTime"
            :max="maxTime"
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

          <!--
            Тот же контейнер, что у подвала пикеров дат: отбивка линией и
            отступ. Без него содержимое слота висело бы вплотную к колонкам и
            читалось бы как их продолжение, а не как отдельное действие.
          -->
          <div v-if="$slots.footer" data-gr-time-picker-footer :class="presetRowClass">
            <slot name="footer" :select="selectTime" :can-select="canSelectTime" :close="shell.closePanel" />
          </div>
        </div>
    </PickerSurface>
  </div>
</template>
