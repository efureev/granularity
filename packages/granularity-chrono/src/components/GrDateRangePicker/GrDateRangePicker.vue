<script setup lang="ts" generic="TItem = Date">
import { computed, nextTick, ref, watch } from 'vue'

import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { titleWhenTruncated } from '@feugene/granularity'
import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { CalendarCell, DisabledDatesInput } from '../../chrono/calendarGrid'
import { createDisabledPredicate } from '../../chrono/calendarGrid'
import { formatPlainDate, formatPlainTime, localeUsesTwelveHour } from '../../chrono/chronoFormat'
import TimeColumns from '../GrTimePicker/TimeColumns.vue'
import type { GrChronoAdapter, GrChronoAdapterName } from '../../chrono/chronoModel'
import { fromPlainParts, resolveChronoAdapter, toPlainDate, toPlainTime } from '../../chrono/chronoModel'
import {
  EDITABLE_DATE_FORMAT,
  editableTimeFormat,
  localeDatePattern,
  localeTimePattern,
  parseLocaleDateTime,
  parsePartialLocaleDateTime,
  splitLocaleRange,
} from '../../chrono/chronoParse'
import type { PlainTime } from '../../chrono/plainTime'
import { floorToStep } from '../../chrono/plainTime'
import type { IsoWeekday, PlainDate } from '../../chrono/plainDate'
import { comparePlainDates, differenceInDays, isPlainDateWithin } from '../../chrono/plainDate'
import {
  clearButtonClass,
  iconClass,
  indicatorClass,
  pickerFieldClass,
  spinnerClass,
  trailingZoneClass,
} from '../../internal/pickerFieldStyles'
import { presetRowClass } from '../../internal/presetRowStyles'
import { rangeTimeLabelClass, rangeTimeRowClass } from './grDateRangePickerStyles'
import PickerSurface from '../../internal/PickerSurface.vue'
import { useEditableField } from '../../internal/useEditableField'
import { rangeCodec, usePickerShell } from '../../internal/usePickerShell'
import GrButton from '@feugene/granularity/components/GrButton'
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
  /**
   * Границы периода задаются с точностью до минут, а не полуночью.
   *
   * Панель получает две колонки времени — для начала и для конца. Порядок
   * произвольный: даты выбираются кликами, время правится когда угодно. Мастера
   * из четырёх шагов здесь нет намеренно — он завёл бы скрытое состояние «на
   * каком мы шаге», из которого промахнувшегося не вывести иначе как пройдя всё
   * заново.
   */
  enableTime?: boolean
  minuteStep?: number
  secondStep?: number
  enableSeconds?: boolean
  /** Не задан — берётся из локали. */
  use12Hours?: boolean
  minRange?: number
  /** Наибольшая длина периода в днях, считая обе границы. */
  maxRange?: number
  /**
   * Готовые периоды в подвале панели: «Сегодня», «Последние 7 дней».
   *
   * Границы можно задать функцией — «последние 7 дней» отсчитываются от
   * сегодняшнего дня, а не от дня, когда объявили проп. Функция обязана быть
   * чистой: её зовут и чтобы решить, доступен ли шорткат, и чтобы применить его.
   *
   * Период вне `min`/`max`, задевающий `disabledDates` или нарушающий
   * `minRange`/`maxRange`, приходит выключенным: кнопка, которая ничего не
   * делает, обманывает.
   */
  presets?: readonly GrDateRangePreset[]
  weekStart?: IsoWeekday
  showWeekNumbers?: boolean
  /** Что считать сегодняшним днём. Задаётся ради воспроизводимых тестов. */
  today?: Date
  /** Вид границ в поле — опциями `Intl`, а не строкой-паттерном. */
  format?: Intl.DateTimeFormatOptions
  /** Разделитель границ в поле. */
  separator?: string
  placeholder?: string
  /**
   * Период можно набрать руками одной строкой. Порядок частей и разделители
   * берутся из локали; чем разделены сами границы, разбору безразлично.
   */
  editable?: boolean
  /** Набранное фиксируется на уходе фокуса, а не только по `Enter`. */
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

/** Готовый период в подвале панели. */
export interface GrDateRangePreset {
  label: string
  /** Пара границ или функция, считающая их в момент показа и нажатия. */
  range: readonly [Date, Date] | (() => readonly [Date, Date])
}

const props = withDefaults(defineProps<GrDateRangePickerProps<TItem>>(), {
  modelValue: undefined,
  valueAdapter: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  enableTime: false,
  minuteStep: 1,
  secondStep: 1,
  enableSeconds: false,
  use12Hours: undefined,
  minRange: undefined,
  maxRange: undefined,
  presets: undefined,
  weekStart: undefined,
  // `undefined`, а не `false`: явный дефолт пикера перебил бы настройку
  // `GrCalendar` из `GrConfigProvider` — панель у них общая.
  showWeekNumbers: undefined,
  today: undefined,
  format: undefined,
  separator: ' — ',
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

const emit = defineEmits<GrDateRangePickerEmits<TItem>>()

defineSlots<{
  /** Своя ячейка дня вместо числа. */
  day?: (props: { cell: CalendarCell, selected: boolean }) => unknown
  /** Своя шапка сетки вместо заголовка и стрелок. */
  header?: (props: { title: string, goToPeriod: (delta: number) => void }) => unknown
  /** Своя ячейка шапки недели вместо сокращённого названия дня. */
  weekday?: (props: { label: string, full: string, isoWeekday: IsoWeekday }) => unknown
  /**
   * Подвал панели.
   *
   * Выбор периода отдаётся внутрь: шорткат обязан выставить **обе** границы и
   * не обойти `minRange`/`maxRange`, `min`/`max` и `disabledDates`, а снаружи
   * этих правил не видно.
   */
  footer?: (props: {
    setRange: (from: Date, to: Date) => boolean
    canSetRange: (from: Date, to: Date) => boolean
    close: () => void
  }) => unknown
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

const minPlain = computed(() => (props.min ? toPlainDate(props.min) : undefined))
const maxPlain = computed(() => (props.max ? toPlainDate(props.max) : undefined))
const todayPlain = computed(() => (props.today ? toPlainDate(props.today) : undefined))

const disabledDates = computed<DisabledDatesInput>(() => {
  const source = props.disabledDates
  if (!source) return undefined
  if (typeof source === 'function') return (date: PlainDate) => source(fromPlainParts(date))

  return source.map(toPlainDate)
})

// ————— Время границ.

const twelveHour = computed(() => props.use12Hours ?? localeUsesTwelveHour(resolvedLocale.value))

/**
 * Конец суток — **последнее значение, которое колонки могут показать**.
 *
 * 23:59 при шаге в 15 минут в колонке отсутствует: минуты остались бы без
 * выбранного варианта, и пользователь не смог бы прочитать конец периода там,
 * где его правит. Поэтому умолчание кладётся на ту же сетку, что и весь столбец,
 * — с шагом в минуту это ровно 23:59, а с крупным шагом последний доступный слот.
 */
const endOfDay = computed<PlainTime>(() => {
  const step = Math.max(1, props.enableSeconds ? props.secondStep : props.minuteStep * 60)

  return floorToStep({ h: 23, min: 59, s: 59 }, step)
})

/**
 * Время выбранных краёв. Пока период не закрыт, правится только начало: у конца
 * ещё нет даты, и колонки правили бы несуществующее значение.
 */
const boundTimes = computed<[PlainTime, PlainTime] | null>(() => {
  const value = selected.value
  if (!value) return null

  return [toPlainTime(value[0]), toPlainTime(value[1])]
})

/**
 * Свежий период получает сутки целиком: 00:00 и 23:59.
 *
 * Две полуночи молча отрезали бы почти весь последний день — «с 1 по 3 августа»
 * по-человечески включает всё третье, и отчёт, посчитанный до 3 августа 00:00,
 * теряет сутки данных.
 */
function withDefaultTimes(from: PlainDate, to: PlainDate): [Date, Date] {
  if (!props.enableTime) return [fromPlainParts(from), fromPlainParts(to)]

  return [fromPlainParts(from, { h: 0, min: 0, s: 0 }), fromPlainParts(to, endOfDay.value)]
}

/** Правка времени края. Переворот периода не применяется — как и чужая длина. */
function setBoundTime(edge: 0 | 1, time: PlainTime): void {
  const value = selected.value
  const times = boundTimes.value
  if (isLocked.value || !value || !times) return

  const next: [Date, Date] = [...value] as [Date, Date]
  next[edge] = fromPlainParts(toPlainDate(value[edge]), time)

  // Внутри одного дня порядок держит только время: без этой проверки конец
  // уезжал бы раньше начала, и период читался бы отрицательной длиной.
  if (next[1].getTime() < next[0].getTime()) {
    // Тиком позже: колонки объявляют выбранный вариант сами, и без задержки
    // «07:59» перебило бы отказ — диктор сообщил бы о выборе, которого не было.
    void nextTick(() => {
      announce(t('grChrono.dateRangePicker.timeRejected', 'The end must not come before the start'))
    })
    return
  }

  shell.commit(next)
}

/**
 * Подпись границы. Со временем — дата и время через запятую, как у
 * `GrDateTimePicker`: два пикера обязаны читаться одинаково.
 */
function boundLabel(date: PlainDate, edge: 0 | 1): string {
  const format = props.format ?? (props.editable ? EDITABLE_DATE_FORMAT : undefined)
  const text = formatPlainDate(resolvedLocale.value, date, format)
  const times = boundTimes.value
  if (!props.enableTime || props.format || !times) return text

  const time = formatPlainTime(resolvedLocale.value, times[edge], props.editable
    ? editableTimeFormat({ seconds: props.enableSeconds, twelveHour: twelveHour.value })
    : {
        hour: twelveHour.value ? 'numeric' : '2-digit',
        minute: '2-digit',
        ...(props.enableSeconds ? { second: '2-digit' } : {}),
        hour12: twelveHour.value,
      })

  return `${text}, ${time}`
}

const displayValue = computed(() => {
  const range = selectedRange.value
  if (!range) return ''

  const [from, to] = range

  return [boundLabel(from, 0), boundLabel(to, 1)].join(props.separator)
})

/**
 * Одна граница из своей половины строки.
 *
 * Время обязательно ровно тогда, когда пикер его показывает: без `enableTime`
 * набранные часы некуда деть, а с ним — нечем заполнить вторую колонку. Молча
 * проглотить и то, и другое значило бы показать значение, которого не вводили.
 */
function parseBound(text: string): Date | null {
  const parts = parseLocaleDateTime(resolvedLocale.value, text)
  if (!parts || props.enableTime !== (parts.time !== null)) return null

  return fromPlainParts(parts.date, parts.time ?? undefined)
}

const field = useEditableField<[Date, Date]>({
  editable: () => props.editable,
  applyOnBlur: () => props.applyOnBlur,
  locked: () => isLocked.value,
  display: () => displayValue.value,
  parse: (text) => {
    const halves = splitLocaleRange(resolvedLocale.value, text)
    if (!halves) return null

    const bounds = halves.map(parseBound)
    if (bounds.some(bound => bound === null)) return null

    // Порядок нормализуется, как и у кликов: период можно вести назад.
    const [from, to] = (bounds as Date[]).sort((a, b) => a.getTime() - b.getTime()) as [Date, Date]

    // Разобралось, но не подошло — это единственный случай, когда сказать
    // нужно вслух: пользователь набрал всё правильно, а не произошло ничего.
    if (!canSetRange(from, to)) {
      announce(t('grChrono.dateRangePicker.lengthRejected', 'This range length is not allowed'))

      return null
    }

    return [from, to]
  },
  commit: (value) => {
    shell.commit(value)
    announceRange(toPlainDate(value[0]), toPlainDate(value[1]))

    // Незакрытый период, начатый в панели, после ввода строкой уже не про то
    // значение, что стоит в поле.
    anchor.value = null
    hovered.value = null
  },
})

/** Плейсхолдер-подсказка: обе границы, чтобы было видно, что их ждут две. */
const fieldPlaceholder = computed(() => {
  if (props.placeholder || !props.editable) return props.placeholder

  const date = localeDatePattern(resolvedLocale.value, {
    day: t('grChrono.datePicker.patternDay', 'D'),
    month: t('grChrono.datePicker.patternMonth', 'M'),
    year: t('grChrono.datePicker.patternYear', 'Y'),
  })

  if (!props.enableTime) return `${date}${props.separator}${date}`

  const time = localeTimePattern(resolvedLocale.value, {
    hour: t('grChrono.timePicker.patternHour', 'H'),
    minute: t('grChrono.timePicker.patternMinute', 'M'),
    second: t('grChrono.timePicker.patternSecond', 'S'),
  }, { seconds: props.enableSeconds, twelveHour: twelveHour.value })

  return `${date}, ${time}${props.separator}${date}, ${time}`
})

function onFieldKeydown(event: KeyboardEvent): void {
  if (field.handleKeydown(event)) return

  shell.onFieldKeydown(event)
}

/**
 * Границы, уже набранные в поле. Пока в строке одна дата, она показывается
 * началом периода — тем же состоянием, что и после первого клика в сетке.
 *
 * Делить строку пополам можно только при чётном числе групп цифр, а по дороге
 * оно бывает и нечётным. Поэтому неудачное деление не гасит подсветку: строка
 * разбирается ещё раз как одна граница.
 */
const previewRange = computed<[PlainDate | null, PlainDate | null]>(() => {
  const draft = field.draft.value
  if (draft === null) return [null, null]

  const bound = (text: string): PlainDate | null => parsePartialLocaleDateTime(
    resolvedLocale.value,
    text,
    { seconds: props.enableSeconds },
  ).date

  const halves = splitLocaleRange(resolvedLocale.value, draft)
  const first = halves ? bound(halves[0]) : null

  return first ? [first, halves ? bound(halves[1]) : null] : [bound(draft), null]
})

const rangeStart = computed(() => (
  previewRange.value[0] ?? anchor.value ?? selectedRange.value?.[0] ?? null
))

const rangeEnd = computed(() => {
  if (previewRange.value[0]) return previewRange.value[1]

  return anchor.value ? null : selectedRange.value?.[1] ?? null
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

/** Границы в хронологическом порядке: кликнуть можно и справа налево. */
function orderPlain(a: PlainDate, b: PlainDate): [PlainDate, PlainDate] {
  return comparePlainDates(a, b) <= 0 ? [a, b] : [b, a]
}

function announceRange(from: PlainDate, to: PlainDate): void {
  announce(t('grChrono.dateRangePicker.rangeSelected', 'Range selected: {from} — {to}', {
    from: formatPlainDate(resolvedLocale.value, from, LONG_DATE),
    to: formatPlainDate(resolvedLocale.value, to, LONG_DATE),
  }))
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
    announce(t('grChrono.dateRangePicker.startSelected', 'Start date selected: {date}. Choose the end date', {
      date: formatPlainDate(resolvedLocale.value, date, LONG_DATE),
    }))
    return
  }

  const [from, to] = orderPlain(anchor.value, date)

  // Слишком короткий или слишком длинный период не выбирается, но и не
  // сбрасывает начало: пользователь просто промахнулся мимо допустимой длины.
  if (!isLengthAllowed(from, to)) {
    announce(t('grChrono.dateRangePicker.lengthRejected', 'This range length is not allowed'))
    return
  }

  shell.commit(withDefaultTimes(from, to))
  announceRange(from, to)
  anchor.value = null
  hovered.value = null

  // Со временем выбор на второй дате не заканчивается: закрыв панель, мы отняли
  // бы у пользователя колонки, ради которых он и включил `enableTime`.
  if (props.enableTime) return

  // Фокус на поле вернёт стек слоёв: на момент закрытия он ещё внутри панели.
  shell.closePanel()
}

const isDisabledDate = computed(() => createDisabledPredicate(disabledDates.value))

/** Выбираема ли граница — тем же правилом, каким сетка гасит ячейку. */
function isDayAllowed(date: PlainDate): boolean {
  return !isDisabledDate.value(date) && isPlainDateWithin(date, minPlain.value, maxPlain.value)
}

/**
 * Допустим ли период. Спрашивается **до** нажатия: кнопка, которая ничего не
 * делает, обманывает, поэтому шорткат с недопустимым периодом приходит
 * выключенным.
 */
function canSetRange(from: Date, to: Date): boolean {
  if (isLocked.value) return false

  const [start, end] = orderPlain(toPlainDate(from), toPlainDate(to))

  return isDayAllowed(start) && isDayAllowed(end) && isLengthAllowed(start, end)
}

/**
 * Выбор периода из подвала — минуя сетку, поэтому со своими проверками.
 *
 * Возвращает `false`, если период запрещён: вызывающему нужно знать, что
 * ничего не произошло.
 */
function setRange(from: Date, to: Date): boolean {
  if (!canSetRange(from, to)) return false

  const [start, end] = orderPlain(toPlainDate(from), toPlainDate(to))

  shell.commit(withDefaultTimes(start, end))
  announceRange(start, end)
  anchor.value = null
  hovered.value = null
  shell.closePanel()

  return true
}

function rangeOf(preset: GrDateRangePreset): readonly [Date, Date] {
  return typeof preset.range === 'function' ? preset.range() : preset.range
}

/**
 * Шорткаты с уже решённой доступностью.
 *
 * Функция-пресет зовётся здесь и ещё раз при нажатии — на первый взгляд лишний
 * вызов, но иначе доступность считалась бы по одному значению, а применялось
 * бы другое. Панель монтируется лениво, так что расчёт идёт с её открытия, а не
 * с загрузки страницы.
 */
const presetRows = computed(() => (props.presets ?? []).map((preset, index) => {
  const [from, to] = rangeOf(preset)

  return { key: `${index}-${preset.label}`, preset, allowed: canSetRange(from, to) }
}))

function applyPreset(preset: GrDateRangePreset): void {
  const [from, to] = rangeOf(preset)

  setRange(from, to)
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
      :panel-label="t('grChrono.dateRangePicker.panelLabel', 'Choose date range')"
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
            :readonly="!editable"
            :aria-readonly="editable ? undefined : 'true'"
            :aria-autocomplete="editable ? 'none' : undefined"
            :value="field.text.value"
            :placeholder="fieldPlaceholder"
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
            :view-date="previewRange[0] ?? undefined"
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
            :aria-label="ariaLabel ?? t('grChrono.datePicker.gridLabel', 'Calendar')"
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
          </GrCalendar>

          <!--
            Время правится когда угодно и в любом порядке: мастер из четырёх
            шагов завёл бы скрытое состояние «на каком мы шаге», из которого
            промахнувшегося не вывести иначе как пройдя всё заново.
          -->
          <div v-if="enableTime && boundTimes" :class="rangeTimeRowClass" data-gr-date-range-picker-times>
            <div v-for="(edge, index) in ([0, 1] as const)" :key="edge" data-gr-date-range-picker-time>
              <div :class="rangeTimeLabelClass">
                {{ index === 0
                  ? t('grChrono.dateRangePicker.startTime', 'Start time')
                  : t('grChrono.dateRangePicker.endTime', 'End time') }}
              </div>
              <TimeColumns
                :model-value="boundTimes[edge]"
                :minute-step="minuteStep"
                :second-step="secondStep"
                :enable-seconds="enableSeconds"
                :twelve-hour="twelveHour"
                :locale="resolvedLocale"
                :size="resolvedSize"
                :locked="isLocked"
                :open="panelOpen"
                @update:model-value="time => setBoundTime(edge, time)"
              />
            </div>
          </div>

          <slot name="footer" :set-range="setRange" :can-set-range="canSetRange" :close="shell.closePanel">
            <div
              v-if="presetRows.length"
              data-gr-date-range-picker-presets
              :class="presetRowClass"
              role="group"
              :aria-label="t('grChrono.dateRangePicker.presetsLabel', 'Quick ranges')"
            >
              <GrButton
                v-for="row in presetRows"
                :key="row.key"
                data-gr-date-range-picker-preset
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
