<script setup lang="ts" generic="TValue = Date | null">
import { computed, ref } from 'vue'

import GrPopover from '@feugene/granularity/components/GrPopover'
import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import { formatPlainTime, localeUsesTwelveHour } from '../../chrono/chronoFormat'
import type { GrChronoAdapter, GrChronoAdapterName } from '../../chrono/chronoModel'
import { fromPlainParts, resolveChronoAdapter, toPlainDate, toPlainTime } from '../../chrono/chronoModel'
import type { PlainTime } from '../../chrono/plainTime'
import {
  clearButtonClass,
  iconClass,
  indicatorClass,
  pickerFieldClass,
  spinnerClass,
  trailingZoneClass,
} from '../../internal/pickerFieldStyles'
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
  clearable?: boolean
  /** Контролируемое состояние панели (`v-model:open`). */
  open?: boolean
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
  // Дефолты живут в резолвере: Vue подставил бы свои раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  clearable: undefined,
  open: undefined,
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
  /** Подвал панели: «сейчас», «очистить». */
  footer?: () => unknown
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
  if (!selectedTime.value) return ''

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
function anchorDate(): Date {
  return selectedDate.value ?? props.today ?? new Date()
}

function onTimeChange(time: PlainTime): void {
  shell.commit(fromPlainParts(toPlainDate(anchorDate()), time))
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

    <GrPopover
      v-model:open="panelOpen"
      :size="resolvedSize"
      :placement="resolvedPlacement"
      :disabled="isDisabled"
      :teleport-to="teleportTo"
      :aria-label="t('gr.timePicker.panelLabel', 'Choose time')"
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
            data-gr-time-picker-field
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

      <template #content>
        <div v-if="hasBeenOpen" data-gr-time-picker-panel>
          <TimeColumns
            ref="columnsRef"
            :model-value="selectedTime"
            :min="minTime"
            :max="maxTime"
            :minute-step="minuteStep"
            :second-step="secondStep"
            :enable-seconds="enableSeconds"
            :twelve-hour="twelveHour"
            :locale="resolvedLocale"
            :size="resolvedSize"
            :locked="isLocked"
            :open="panelOpen"
            @update:model-value="onTimeChange"
          />

          <slot name="footer" />
        </div>
      </template>
    </GrPopover>
  </div>
</template>
