<script setup lang="ts" generic="TValue = Date | null">
import { computed, ref } from 'vue'

import { titleWhenTruncated } from '@feugene/granularity'
import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { CalendarCell, DisabledDatesInput } from '../../chrono/calendarGrid'
import { createDisabledPredicate } from '../../chrono/calendarGrid'
import { formatPlainDate } from '../../chrono/chronoFormat'
import { EDITABLE_DATE_FORMAT, localeDatePattern, maskLocaleDate, parseLocaleDate } from '../../chrono/chronoParse'
import type { GrChronoAdapter, GrChronoAdapterName } from '../../chrono/chronoModel'
import { fromPlainParts, resolveChronoAdapter, toPlainDate } from '../../chrono/chronoModel'
import type { IsoWeekday, PlainDate } from '../../chrono/plainDate'
import { comparePlainDates, isPlainDateWithin, plainDateKey } from '../../chrono/plainDate'
import {
  clearButtonClass,
  iconClass,
  indicatorClass,
  pickerFieldClass,
  spinnerClass,
  trailingZoneClass,
} from '../../internal/pickerFieldStyles'
import { presetRowClass } from '../../internal/presetRowStyles'
import PickerSurface from '../../internal/PickerSurface.vue'
import { useEditableField } from '../../internal/useEditableField'
import type { PickerCodec } from '../../internal/usePickerShell'
import { dateCodec, multipleCodec, usePickerShell } from '../../internal/usePickerShell'
import GrButton from '@feugene/granularity/components/GrButton'
import GrCalendar from '../GrCalendar/GrCalendar.vue'

import type { GrDatePickerSize } from './grDatePickerStyles'

/**
 * GrDatePicker — поле с датой и панелью-календарём.
 *
 * Границей между мирами служит именно этот компонент: наружу он говорит на
 * `Date` (или на том, что задаёт `valueAdapter`), внутрь — кортежами
 * `PlainDate`, на которых считает весь пакет.
 *
 * Пока `editable` не включён, поле честно помечено `readonly`: значение
 * меняется только через панель.
 */
export interface GrDatePickerProps<T = Date | null> {
  /**
   * Что выбирается: день, месяц или год. В режимах периода панель показывает
   * двенадцать ячеек, а значением становится первое число периода.
   */
  mode?: 'day' | 'week' | 'month' | 'quarter' | 'year'
  /**
   * Значение. При `multiple` — массив: набор, а не диапазон.
   *
   * Точнее объединения в генерик-SFC не выразить: условный тип от булева пропа
   * Vue выводит ненадёжно, а обещание, которое иногда не работает, хуже
   * честного `T | readonly T[]`. Рантайм-контракт при этом точный — наружу
   * уходит ровно то, что объявлено пропом.
   */
  modelValue?: T | readonly T[]
  /**
   * Набор дат вместо одной: расписание, даты-исключения, брони.
   *
   * Отличие от `GrDateRangePicker` — в существе: там непрерывный отрезок с
   * двумя краями, здесь произвольное множество. Панель после выбора не
   * закрывается, а клик по выбранной дате её снимает.
   */
  multiple?: boolean
  /** Чем разделять даты набора в поле. */
  separator?: string
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
  /**
   * Готовые даты в подвале панели: «Сегодня», «Завтра».
   *
   * Дату можно задать функцией — «сегодня» считается в момент показа, а не в
   * момент объявления пропа. Функция обязана быть чистой: её зовут и чтобы
   * решить, доступен ли шорткат, и чтобы применить его.
   *
   * Дата вне `min`/`max` или из `disabledDates` приходит выключенной — как и
   * её ячейка в сетке.
   */
  presets?: readonly GrDatePreset[]
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
  /**
   * Дату можно набрать руками. Порядок частей и разделитель берутся из локали,
   * поэтому свой паттерн задавать не нужно — и нельзя: формат показа задаёт
   * `format`, а разбор идёт по локали.
   *
   * В режимах `month` и `year` ввод не включается: набирать «август 2026»
   * текстом — это разбор названий месяцев, то есть другая задача.
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
  (e: 'update:modelValue', value: T | readonly T[] | null): void
  (e: 'change', value: T | readonly T[] | null): void
  (e: 'update:open', value: boolean): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

/** Готовая дата в подвале панели. */
export interface GrDatePreset {
  label: string
  /** Дата или функция, считающая её в момент показа и нажатия. */
  date: Date | (() => Date)
}

const props = withDefaults(defineProps<GrDatePickerProps<TValue>>(), {
  mode: 'day',
  modelValue: undefined,
  valueAdapter: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  presets: undefined,
  weekStart: undefined,
  // `undefined`, а не `false`: явный дефолт пикера перебил бы настройку
  // `GrCalendar` из `GrConfigProvider` — панель у них общая.
  showWeekNumbers: undefined,
  today: undefined,
  locale: undefined,
  format: undefined,
  placeholder: undefined,
  editable: false,
  multiple: false,
  separator: ', ',
  applyOnBlur: true,
  // Дефолты живут в резолвере: Vue подставил бы свои раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  clearable: undefined,
  open: undefined,
  inline: false,
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
  header?: (props: { title: string, goToPeriod: (delta: number) => void }) => unknown
  /** Своя ячейка шапки недели вместо сокращённого названия дня. */
  weekday?: (props: { label: string, full: string, isoWeekday: IsoWeekday }) => unknown
  /**
   * Подвал панели.
   *
   * Выбор отдаётся внутрь: запрет даты складывается из `min`, `max` и
   * `disabledDates`, а `readonly` запрещает выбор целиком — снаружи этих
   * правил не видно.
   */
  footer?: (props: {
    select: (date: Date) => boolean
    canSelect: (date: Date) => boolean
    close: () => void
  }) => unknown
}>()

const calendarRef = ref<InstanceType<typeof GrCalendar> | null>(null)

const shell = usePickerShell<TValue | readonly TValue[], Date | Date[]>({
  props: () => props,
  // Форма модели объявлена пропом, и кодек выбирается по нему. Приведение — на
  // одной этой границе: дальше `selectedList` разводит оба случая в один вид.
  codec: () => {
    const adapter = resolveChronoAdapter<TValue>(props.valueAdapter)

    return (props.multiple ? multipleCodec(adapter) : dateCodec(adapter)) as PickerCodec<TValue | readonly TValue[], Date | Date[]>
  },
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
  selected: selectedDate,
  formValues,
  panelOpen,
  hasBeenOpen,
  fieldEl,
  showClear,
} = shell

/** Выбранное одним видом: набор — списком, одиночное — списком из одного. */
const selectedList = computed<PlainDate[]>(() => {
  const raw = selectedDate.value
  if (!raw)
    return []

  return Array.isArray(raw) ? raw.map(toPlainDate) : [toPlainDate(raw)]
})

const selected = computed<PlainDate | null>(() => (
  props.multiple ? null : selectedList.value[0] ?? null
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
  if (!source)
    return undefined
  if (typeof source === 'function')
    return (date: PlainDate) => source(fromPlainParts(date))

  return source.map(toPlainDate)
})

/** Показ по умолчанию соответствует режиму: день, месяц с годом или год. */
/** Ввод руками — только в дневном режиме: у периодов текстом набирать нечего. */
const isEditable = computed(() => props.editable && props.mode === 'day' && !props.multiple)

const displayFormat = computed<Intl.DateTimeFormatOptions | undefined>(() => {
  if (props.format)
    return props.format
  if (props.mode === 'month')
    return { month: 'long', year: 'numeric' }
  if (props.mode === 'year')
    return { year: 'numeric' }

  return isEditable.value ? EDITABLE_DATE_FORMAT : undefined
})

/** Сколько дат показывать в поле, прежде чем свернуть остальные в «и ещё N». */
const DISPLAY_LIMIT = 3

const displayValue = computed(() => {
  const list = selectedList.value
  if (list.length === 0)
    return ''

  if (!props.multiple)
    return formatPlainDate(resolvedLocale.value, list[0]!, displayFormat.value)

  // Потолок обязателен: без него поле переполняется на пятой дате, а набор из
  // тридцати превращает подпись в нечитаемую строку.
  // Остаток считается по массиву, а не по собранной строке: разделитель может
  // встретиться внутри самого формата даты, и `split` соврал бы.
  const head = list.slice(0, DISPLAY_LIMIT)
  const shown = head
    .map(date => formatPlainDate(resolvedLocale.value, date, displayFormat.value))
    .join(props.separator)

  const rest = list.length - head.length

  return rest > 0 ? `${shown} ${t('grChrono.datePicker.andMore', 'and {count} more', { count: rest })}` : shown
})

const field = useEditableField({
  editable: () => isEditable.value,
  applyOnBlur: () => props.applyOnBlur,
  locked: () => shell.isLocked.value,
  display: () => displayValue.value,
  mask: raw => maskLocaleDate(resolvedLocale.value, raw),
  parse: (text) => {
    const parsed = parseLocaleDate(resolvedLocale.value, text)
    if (!parsed)
      return null

    // Запрещённая дата не выбирается ни кликом, ни `Enter`: сетка такую ячейку
    // просто не даёт нажать, а текст обязан спросить сам.
    const date = fromPlainParts(parsed)

    return canSelectDate(date) ? date : null
  },
  commit: date => shell.commit(date),
})

/**
 * Плейсхолдер редактируемого поля по умолчанию — подсказка формата: без неё
 * пользователь не знает, что от него ждут, а порядок частей у локалей разный.
 */
const fieldPlaceholder = computed(() => {
  if (props.placeholder || !isEditable.value)
    return props.placeholder

  return localeDatePattern(resolvedLocale.value, {
    day: t('grChrono.datePicker.patternDay', 'D'),
    month: t('grChrono.datePicker.patternMonth', 'M'),
    year: t('grChrono.datePicker.patternYear', 'Y'),
  })
})

function onFieldKeydown(event: KeyboardEvent): void {
  if (field.handleKeydown(event))
    return

  shell.onFieldKeydown(event)
}

/**
 * Сетка идёт за набором: как только дата набрана целиком, она подсвечена и
 * показан её месяц. Модель при этом не тронута — подтверждает `Enter`.
 */
const shownDate = computed<PlainDate | null>(() => {
  const draft = field.draft.value

  return (draft === null ? null : parseLocaleDate(resolvedLocale.value, draft)) ?? selected.value
})
/**
 * Набор с переключённой датой: была — снимается, не была — добавляется.
 *
 * Порядок по возрастанию держится всегда: модель обязана быть сравнима, и
 * перестановка элементов не должна читаться как изменение.
 */
function toggled(date: PlainDate): Date[] {
  const key = plainDateKey(date)
  const rest = selectedList.value.filter(item => plainDateKey(item) !== key)
  const next = rest.length === selectedList.value.length ? [...rest, date] : rest

  return next.sort(comparePlainDates).map(item => fromPlainParts(item))
}

function onSelect(date: PlainDate): void {
  // Гард здесь, а не только в `commit`: закрытая по клику панель выглядела бы
  // так, будто выбор состоялся.
  if (shell.isLocked.value)
    return

  // Набор набирают, а не выбирают однажды: панель остаётся открытой.
  if (props.multiple) {
    shell.commit(toggled(date))
    return
  }

  shell.commit(fromPlainParts(date))

  // Фокус на поле вернёт стек слоёв: на момент закрытия он ещё внутри панели.
  shell.closePanel()
}

const isDisabledDate = computed(() => createDisabledPredicate(disabledDates.value))

/**
 * Выбираема ли дата — тем же правилом, каким сетка гасит ячейку.
 *
 * Подвал сетку обходит, поэтому спрашивает явно; кнопка с недоступной датой
 * приходит выключенной, а не молча ничего не делает.
 */
function canSelectDate(date: Date): boolean {
  if (shell.isLocked.value)
    return false

  const plain = toPlainDate(date)

  return !isDisabledDate.value(plain) && isPlainDateWithin(plain, minPlain.value, maxPlain.value)
}

/** Выбор из подвала. Возвращает `false`, если дата запрещена. */
function selectDate(date: Date): boolean {
  if (!canSelectDate(date))
    return false

  if (props.multiple) {
    shell.commit(toggled(toPlainDate(date)))
    return true
  }

  shell.commit(fromPlainParts(toPlainDate(date)))
  shell.closePanel()

  return true
}

function dateOf(preset: GrDatePreset): Date {
  return typeof preset.date === 'function' ? preset.date() : preset.date
}

/**
 * Шорткаты с уже решённой доступностью.
 *
 * Функция-пресет зовётся здесь и ещё раз при нажатии: иначе доступность
 * считалась бы по одному значению, а применялось бы другое. Панель монтируется
 * лениво, так что расчёт идёт с её открытия, а не с загрузки страницы.
 */
const presetRows = computed(() => (props.presets ?? []).map((preset, index) => ({
  key: `${index}-${preset.label}`,
  preset,
  allowed: canSelectDate(dateOf(preset)),
})))

function applyPreset(preset: GrDatePreset): void {
  selectDate(dateOf(preset))
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
      :panel-label="t('grChrono.datePicker.panelLabel', 'Choose date')"
      @update:open="panelOpen = $event"
    >
      <template v-if="!inline" #trigger="{ triggerProps }">
        <div class="relative">
          <input
            :id="inputId"
            ref="fieldEl"
            v-bind="triggerProps"
            data-gr-date-picker-field
            type="text"
            role="combobox"
            :readonly="!isEditable"
            :aria-readonly="isEditable ? undefined : 'true'"
            :aria-autocomplete="isEditable ? 'none' : undefined"
            :value="field.text.value"
            :placeholder="fieldPlaceholder"
            :class="fieldClass"
            :disabled="isDisabled"
            :aria-label="ariaLabel"
            :aria-describedby="describedBy"
            :aria-invalid="isInvalid ? 'true' : undefined"
            :aria-required="isRequired ? 'true' : undefined"
            :aria-busy="loading ? 'true' : undefined"
            @click="isEditable ? shell.openPanel(false) : shell.togglePanel()"
            @keydown="onFieldKeydown"
            @input="field.onInput"
            @focus="emit('focus', $event)"
            @pointerenter="titleWhenTruncated"
            @blur="field.onBlur(); emit('blur', $event)"
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

      <div v-if="hasBeenOpen" data-gr-date-picker-panel :style="calendarVars">
          <GrCalendar
            ref="calendarRef"
            :mode="mode"
            :model-value="shownDate"
            :selected-dates="multiple ? selectedList : undefined"
            :min="minPlain"
            :max="maxPlain"
            :disabled-dates="disabledDates"
            :week-start="weekStart"
            :show-week-numbers="showWeekNumbers"
            :today="todayPlain"
            :locale="locale"
            :size="resolvedSize"
            :readonly="isReadonly"
            :aria-label="ariaLabel ?? t('grChrono.datePicker.gridLabel', 'Calendar')"
            @update:model-value="onSelect"
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
          </GrCalendar>

          <slot name="footer" :select="selectDate" :can-select="canSelectDate" :close="shell.closePanel">
            <div
              v-if="presetRows.length"
              data-gr-date-picker-presets
              :class="presetRowClass"
              role="group"
              :aria-label="t('grChrono.datePicker.presetsLabel', 'Quick dates')"
            >
              <GrButton
                v-for="row in presetRows"
                :key="row.key"
                data-gr-date-picker-preset
                type="button"
                variant="ghost"
                :size="resolvedSize"
                :disabled="!row.allowed"
                @click="applyPreset(row.preset)"
              >
                {{ row.preset.label }}
              </GrButton>
            </div>
          </slot>
        </div>
    </PickerSurface>
  </div>
</template>
