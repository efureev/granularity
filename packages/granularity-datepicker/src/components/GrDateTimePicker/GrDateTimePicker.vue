<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { VueDatePicker, type ModelValue } from '@vuepic/vue-datepicker'
import { enUS, ru } from 'date-fns/locale'

import '@vuepic/vue-datepicker/dist/main.css'

import type { GrDateTimeModel, GrDateTimePickerProps } from '../../types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<GrDateTimePickerProps>(), {
  modelValue: null,
  mode: 'date',
  range: false,
  locale: undefined,
  placeholder: undefined,
  disabled: false,
  clearable: true,
  autoApply: true,
  enableSeconds: false,
  minDate: undefined,
  maxDate: undefined,
  format: undefined,
  modelType: undefined,
  teleport: true,
  ui: undefined,
  datepickerProps: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: GrDateTimeModel): void
  (e: 'change', value: GrDateTimeModel): void
  (e: 'cleared'): void
}>()

const attrs = useAttrs()

// Маппинг GR-режима на флаги `@vuepic/vue-datepicker`. Единственный источник
// правды — проп `mode`; ниже он раскладывается в конкретные булевы флаги пакета.
const isTimeOnly = computed(() => props.mode === 'time')
const enableTimePicker = computed(() => props.mode === 'datetime')
const isMonthPicker = computed(() => props.mode === 'month')
const isYearPicker = computed(() => props.mode === 'year')

const effectiveLocale = computed(() => {
  if (props.locale === 'ru') return ru
  if (props.locale === 'en') return enUS
  return undefined
})

const effectiveUi = computed<Record<string, unknown>>(() => {
  const base: Record<string, unknown> = {
    // `@vuepic/vue-datepicker` рендерит иконки (календарь/очистка) внутри
    // input-обёртки. Держим достаточный left/right padding, чтобы текст не
    // налезал на иконки, и мапим визуал на GR-токены.
    input:
      'h-10 w-full rounded-md border border-[var(--brd)] bg-[var(--bg)] pl-10 pr-12 text-[14px] text-[var(--fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed',
    menu: 'shadow-[var(--gr-shadow-2)]',
  }

  return props.ui ? { ...base, ...props.ui } : base
})

// Escape-hatch `datepickerProps` перекрывает всё остальное (last-wins),
// поэтому мержим его поверх `attrs`.
const passthrough = computed<Record<string, unknown>>(() => ({
  ...attrs,
  ...(props.datepickerProps ?? {}),
}))

// Адаптерный слой. GR-контракт намеренно шире (допускает `null`/`number`),
// чем строгие типы `@vuepic/vue-datepicker`. Приводим значения к типам пакета
// ровно на границе интеграции — так публичный API остаётся GR-owned, а утечки
// vuepic-типов наружу нет. Каст локализован здесь и только здесь.
const pickerModel = computed<ModelValue>(() => props.modelValue as ModelValue)
const pickerMinDate = computed(() => (props.minDate ?? undefined) as Date | string | undefined)
const pickerMaxDate = computed(() => (props.maxDate ?? undefined) as Date | string | undefined)

function onUpdateModelValue(value: GrDateTimeModel) {
  emit('update:modelValue', value)
  emit('change', value)
  if (value === null || (Array.isArray(value) && value.length === 0)) emit('cleared')
}
</script>

<template>
  <div class="gr-date-time-picker">
    <VueDatePicker
      v-bind="passthrough"
      :model-value="pickerModel"
      :model-type="props.modelType"
      :locale="effectiveLocale"
      :range="props.range"
      :time-picker="isTimeOnly"
      :month-picker="isMonthPicker"
      :year-picker="isYearPicker"
      :time-config="{ enableTimePicker, enableSeconds: props.enableSeconds }"
      :clearable="props.clearable"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :auto-apply="props.autoApply"
      :min-date="pickerMinDate"
      :max-date="pickerMaxDate"
      :format="props.format"
      :teleport="props.teleport"
      :ui="effectiveUi"
      @update:model-value="onUpdateModelValue"
    >
      <!-- Прозрачно пробрасываем все слоты `@vuepic/vue-datepicker`
           (кастомный триггер, action-row, day-cell и т.д.). -->
      <template v-for="(_slot, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </VueDatePicker>
  </div>
</template>

<style scoped>
.gr-date-time-picker {
  /* Маппинг тем-переменных VueDatePicker на GR-токены. */
  --dp-background-color: var(--bg);
  --dp-text-color: var(--fg);

  --dp-hover-color: var(--muted);
  --dp-hover-text-color: var(--fg);
  --dp-hover-icon-color: var(--muted-fg);
  --dp-icon-color: var(--muted-fg);

  --dp-primary-color: var(--primary);
  --dp-primary-disabled-color: var(--primary-hover);
  --dp-primary-text-color: var(--primary-fg);

  --dp-secondary-color: var(--muted-fg);

  --dp-border-color: var(--brd);
  --dp-menu-border-color: var(--brd);
  --dp-border-color-hover: var(--brd-hover);
  --dp-border-color-focus: var(--ring);

  --dp-disabled-color: var(--muted);
  --dp-disabled-color-text: var(--muted-fg);

  --dp-success-color: var(--gr-success);
  --dp-danger-color: var(--destructive);

  --dp-font-family: var(--gr-font-ui);
  --dp-font-size: var(--gr-text-sm);
  --dp-border-radius: var(--gr-radius-md);
}
</style>
