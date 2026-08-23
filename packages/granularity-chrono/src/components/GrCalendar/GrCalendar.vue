<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useRovingFocus } from '@feugene/granularity/composables/useRovingFocus'
import { useGrComponentDefaults, useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'

import type { CalendarCell, DisabledDatesInput } from '../../chrono/calendarGrid'
import { clockDate } from '../../chrono/chronoModel'
import { buildCalendarGrid, createDisabledPredicate, startOfWeek } from '../../chrono/calendarGrid'
import {
  formatMonthTitle,
  formatPlainDate,
  formatYearTitle,
  localeFirstDayOfWeek,
  monthNames,
  weekdayNames,
  weekdayOrder,
} from '../../chrono/chronoFormat'
import type { PeriodCell, PeriodMode } from '../../chrono/periodGrid'
import { buildPeriodGrid, decadeLabel, decadeStart } from '../../chrono/periodGrid'
import type { IsoWeekday, PlainDate } from '../../chrono/plainDate'
import {
  addMonths,
  addYears,
  clampPlainDate,
  comparePlainDates,
  isPlainDateWithin,
  isSamePlainDate,
  plainDateKey,
} from '../../chrono/plainDate'
import type { GrCalendarSize } from './grCalendarStyles'
import {
  calendarDayClass,
  calendarGridClass,
  calendarPeriodClass,
  calendarPeriodGridClass,
  calendarQuarterGridClass,
  calendarRangeCellClass,
  calendarHeaderClass,
  calendarNavButtonClass,
  calendarNavSizes,
  calendarRootClass,
  calendarTitleClass,
  calendarWeekdayClass,
  calendarWeekNumberClass,
} from './grCalendarStyles'

/**
 * GrCalendar — сетка месяца по WAI-ARIA паттерну `grid`.
 *
 * Самостоятельный компонент и одновременно начинка всех пикеров пакета.
 * Поля ввода у него нет: это именно сетка, а «поле + панель» собирается
 * поверх неё.
 *
 * Значение — `PlainDate`, а не `Date`: компонент живёт внутри пакета, где
 * `Date` появляется только на границе модели. Оболочка-пикер переводит одно
 * в другое адаптером.
 */
export interface GrCalendarProps {
  /**
   * Что выбирается: день, месяц или год. В режимах периода сетка показывает
   * двенадцать ячеек в три колонки, а выбор отдаёт первое число периода.
   */
  mode?: 'day' | 'week' | PeriodMode
  /** Выбранная дата. `null` — ничего не выбрано. */
  modelValue?: PlainDate | null
  /** Показываемый месяц. Без него календарь ведёт его сам, отталкиваясь от выбора. */
  viewDate?: PlainDate
  min?: PlainDate
  max?: PlainDate
  /** Запрещённые даты: список или предикат. Список нормализуется в `Set` один раз. */
  disabledDates?: DisabledDatesInput
  /**
   * Первый день недели по ISO (1 — понедельник). Не задан — берётся из локали
   * через `Intl`.
   */
  weekStart?: IsoWeekday
  showWeekNumbers?: boolean
  /** Что считать сегодняшним днём. Задаётся ради воспроизводимых тестов и снимков. */
  today?: PlainDate
  /** Локаль показа. Не задана — из адаптера i18n приложения. */
  locale?: string
  size?: GrCalendarSize
  disabled?: boolean
  readonly?: boolean
  /** Доступное имя сетки, когда рядом нет подписи. */
  ariaLabel?: string
  /**
   * Начало выбранного диапазона. Сетка про диапазон ничего не решает — только
   * рисует его: считать границы, порядок и ограничения длины — дело пикера.
   */
  rangeStart?: PlainDate | null
  /** Конец выбранного диапазона. */
  rangeEnd?: PlainDate | null
  /**
   * Второй край предпросмотра, пока диапазон не закрыт: день под курсором или
   * под клавиатурной остановкой.
   */
  rangePreview?: PlainDate | null
  /**
   * Набор выбранных дат. Как и у диапазона, сетка про него ничего не решает —
   * только рисует: складывать, снимать и сортировать набор — дело пикера.
   */
  selectedDates?: readonly PlainDate[]
  /**
   * Объявлять выбор в живом регионе. Выключается, когда объявляет оболочка:
   * у диапазона осмысленно состояние периода («начало выбрано»), а не
   * отдельный день, и два объявления на один клик перебили бы друг друга.
   */
  announceSelection?: boolean
}

export interface GrCalendarEmits {
  (e: 'update:modelValue', value: PlainDate): void
  (e: 'update:viewDate', value: PlainDate): void
  (e: 'change', value: PlainDate): void
  /** Показываемый период сменился — листанием, клавиатурой или выбором. */
  (e: 'periodChange', value: PlainDate): void
  /** День под курсором сменился. `null` — курсор ушёл из сетки. */
  (e: 'dayHover', value: PlainDate | null): void
}

const props = withDefaults(defineProps<GrCalendarProps>(), {
  mode: 'day',
  modelValue: null,
  viewDate: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  weekStart: undefined,
  // Дефолт живёт в резолвере: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  showWeekNumbers: undefined,
  today: undefined,
  locale: undefined,
  size: undefined,
  disabled: false,
  readonly: false,
  ariaLabel: undefined,
  rangeStart: null,
  rangeEnd: null,
  rangePreview: null,
  announceSelection: true,
})

const emit = defineEmits<GrCalendarEmits>()

defineSlots<{
  /** Своя ячейка дня вместо числа. */
  day?: (props: { cell: CalendarCell, selected: boolean }) => unknown
  /** Своя шапка вместо заголовка и стрелок. */
  header?: (props: { title: string, goToPeriod: (delta: number) => void }) => unknown
  /** Своя ячейка шапки недели вместо сокращённого названия дня. */
  weekday?: (props: { label: string, full: string, isoWeekday: IsoWeekday }) => unknown
  /**
   * Подвал панели: кнопки «сегодня», «очистить», готовые периоды.
   *
   * Выбор отдаётся внутрь, потому что снаружи его не повторить: запрет даты
   * складывается из `min`, `max` и `disabledDates`, а `readonly` запрещает
   * любой выбор целиком.
   */
  footer?: (props: {
    select: (date: PlainDate) => boolean
    canSelect: (date: PlainDate) => boolean
  }) => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()
const { announce } = useAnnouncer()

const resolvedSize = useGrComponentSize<GrCalendarSize>(() => props.size, { component: 'GrCalendar' })
const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')
const calendarDefaults = useGrComponentDefaults('GrCalendar')

/**
 * Цепочка `weekStart` написана руками, а не через `useGrComponentProp`.
 *
 * Последнее звено здесь не константа, а вывод из локали, — `useGrComponentProp`
 * же принимает статический `fallback` и вычислил бы его один раз на setup.
 * Смена локали на лету перестала бы двигать первый день недели.
 */
const resolvedWeekStart = computed(
  () => props.weekStart ?? calendarDefaults.value.weekStart ?? localeFirstDayOfWeek(resolvedLocale.value),
)
const resolvedShowWeekNumbers = useGrComponentProp('GrCalendar', 'showWeekNumbers', () => props.showWeekNumbers, false)

const gridId = useId()
const titleId = useId()

/** Заблокирован целиком: ни выбора, ни листания. */
const isLocked = computed(() => props.disabled || props.readonly)

/**
 * Показываемый месяц. Управляемый через `viewDate` либо собственный —
 * контракт тот же, что у панельных оверлеев ядра.
 */
const internalView = ref<PlainDate | undefined>()

/**
 * Часы читаются один раз на экземпляр, а не при каждом обращении к `viewDate`:
 * иначе календарь, открытый в 23:59:59, менял бы показываемый месяц прямо во
 * время перерисовки.
 */
const clockToday = clockDate()

/**
 * Показ выведен из часов — значит серверный рендер и клиентский могут разойтись
 * (сервер обычно в UTC, браузер — в своей зоне; около полуночи это разные
 * месяцы). Отвечает за это `data-allow-mismatch` на корне: расхождение здесь
 * ожидаемое, и глушится оно точечно, а не на всём поддереве приложения.
 *
 * Убирается это не флагом, а данными: передайте `today` или `viewDate` — и
 * рендер станет детерминированным, а атрибут исчезнет сам.
 */
const viewFromClock = computed(() => (
  props.viewDate === undefined
  && internalView.value === undefined
  && !props.modelValue
  && props.today === undefined
))

const viewDate = computed<PlainDate>(() => {
  const source = props.viewDate ?? internalView.value ?? props.modelValue ?? props.today ?? clockToday
  // Показывать месяц, целиком выпавший за границы, незачем.
  return clampPlainDate(source, props.min, props.max)
})

const isDisabledDate = computed(() => createDisabledPredicate(props.disabledDates))

/**
 * Сетка пересобирается только при смене месяца, границ, первого дня недели
 * или набора запрещённых дат. Выбор и наведение в неё не входят — иначе
 * движение мыши по диапазону пересобирало бы 42 объекта на каждый кадр.
 */
const grid = computed(() => buildCalendarGrid({
  year: viewDate.value.y,
  month: viewDate.value.m,
  firstDayOfWeek: resolvedWeekStart.value,
  today: props.today,
  min: props.min,
  max: props.max,
  isDisabled: isDisabledDate.value,
}))

/** Неделя рисуется сеткой дней: двенадцать недель в сетке периодов выбирать нечем. */
const isWeekMode = computed(() => props.mode === 'week')
const isDayMode = computed(() => props.mode === 'day' || isWeekMode.value)

/**
 * Сетка периодов строится только в своём режиме: в дневном она осталась бы
 * висеть в памяти вместе с двенадцатью объектами, которые никто не смотрит.
 */
const periodCells = computed<PeriodCell[]>(() => (
  isDayMode.value
    ? []
    : buildPeriodGrid({
        mode: props.mode as PeriodMode,
        year: viewDate.value.y,
        min: props.min,
        max: props.max,
        today: props.today,
      })
))

const periodLabels = computed(() => (props.mode === 'month' ? monthNames(resolvedLocale.value, 'short') : []))

/**
 * Подпись ячейки периода.
 *
 * Месяцы приходят из `Intl` (инвариант 2), кварталы — строкой локали пакета:
 * `Intl` их не именует вовсе, и «Q1» против «I кв.» — это интерфейсный текст,
 * а не локале-зависимые данные.
 */
function periodLabel(cell: PeriodCell): string {
  if (props.mode === 'month')
    return periodLabels.value[cell.value] ?? String(cell.value)
  if (props.mode === 'quarter')
    return t('grChrono.calendar.quarter', 'Q{n}', { n: cell.value + 1 })

  return String(cell.value)
}

/** Заголовок: месяц с годом, год или десятилетие — смотря что показываем. */
const periodTitle = computed(() => {
  if (props.mode === 'month' || props.mode === 'quarter')
    return formatYearTitle(resolvedLocale.value, viewDate.value.y)
  if (props.mode === 'year')
    return decadeLabel(viewDate.value.y)

  return formatMonthTitle(resolvedLocale.value, viewDate.value.y, viewDate.value.m)
})

const weekdays = computed(() => weekdayNames(resolvedLocale.value, resolvedWeekStart.value))

/** Полные названия дней — в `abbr`, чтобы скринридер не читал «пн» по буквам. */
const weekdaysFull = computed(() => weekdayNames(resolvedLocale.value, resolvedWeekStart.value, 'long'))

/** Колонка шапки одним объектом: подпись, полное название и ISO-номер дня. */
const weekdayColumns = computed(() => weekdayOrder(resolvedWeekStart.value).map((isoWeekday, index) => ({
  isoWeekday,
  label: weekdays.value[index] ?? '',
  full: weekdaysFull.value[index] ?? '',
})))

/**
 * Выбор считается на отрисовке сравнением кортежей — инвариант 3.
 *
 * В режиме недели сравниваются начала недель, а не сами даты: подсвечивается
 * вся строка, и ячейка по-прежнему ничего о выборе не знает.
 */
/**
 * Ключи набора — `Set`, собранный один раз на смену набора.
 *
 * Обход массива на каждую из сорока двух ячеек превратил бы подсветку в
 * квадрат: тот же довод, по которому `createDisabledPredicate` нормализует
 * список запрещённых дат, и он там закреплён тестом со шпионом на `Set.has`.
 */
const selectedKeys = computed(() => new Set((props.selectedDates ?? []).map(plainDateKey)))

function isSelected(cell: CalendarCell): boolean {
  if (selectedKeys.value.size > 0)
    return selectedKeys.value.has(cell.key)

  const selected = props.modelValue
  if (!selected)
    return false

  return isWeekMode.value
    ? isSamePlainDate(startOfWeek(cell.date, resolvedWeekStart.value), startOfWeek(selected, resolvedWeekStart.value))
    : isSamePlainDate(cell.date, selected)
}

/**
 * Отрезок, который сейчас показывается: закрытый диапазон либо предпросмотр от
 * начала до дня под курсором. Границы упорядочиваются здесь, потому что вести
 * курсор можно и назад.
 */
const shownRange = computed<[PlainDate, PlainDate] | null>(() => {
  const start = props.rangeStart
  if (!start)
    return null

  const end = props.rangeEnd ?? props.rangePreview
  if (!end)
    return [start, start]

  return comparePlainDates(start, end) <= 0 ? [start, end] : [end, start]
})

/**
 * Принадлежность отрезку считается **на отрисовке**, сравнением кортежей, а не
 * хранится в ячейке. Иначе движение мыши по диапазону пересобирало бы 42
 * объекта на каждый кадр — ради этого сетка и не знает про выбор.
 */
function rangeStateOf(cell: CalendarCell): { inRange: boolean, start: boolean, end: boolean } {
  const range = shownRange.value
  if (!range)
    return { inRange: false, start: false, end: false }

  const [from, to] = range
  const inside = comparePlainDates(cell.date, from) >= 0 && comparePlainDates(cell.date, to) <= 0

  return {
    inRange: inside,
    start: inside && isSamePlainDate(cell.date, from),
    end: inside && isSamePlainDate(cell.date, to),
  }
}

/** Край диапазона выглядит выбранным: заливка та же, что у одиночного выбора. */
function isEdge(cell: CalendarCell): boolean {
  const state = rangeStateOf(cell)
  return state.start || state.end
}

const dayEls = ref(new Map<string, HTMLElement>())

function setDayEl(key: string, element: unknown): void {
  if (element instanceof HTMLElement)
    dayEls.value.set(key, element)
  else dayEls.value.delete(key)
}

const cellByKey = computed(() => new Map(grid.value.cells.map(cell => [cell.key, cell])))
const periodByKey = computed(() => new Map(periodCells.value.map(cell => [cell.key, cell])))

/** Ключи ячеек текущего режима — по ним ходит roving-фокус. */
const cellKeys = computed(() => (
  isDayMode.value ? grid.value.cells.map(cell => cell.key) : periodCells.value.map(cell => cell.key)
))

/** Ячейка периода, попавшая в выбор: месяц выбранной даты, её квартал либо год. */
const selectedPeriodKey = computed(() => {
  const selected = props.modelValue
  if (!selected || isDayMode.value)
    return undefined

  return periodCells.value.find((cell) => {
    if (props.mode === 'month')
      return cell.date.y === selected.y && cell.value === selected.m
    if (props.mode === 'quarter')
      return cell.date.y === selected.y && cell.value === Math.floor(selected.m / 3)

    return cell.value === selected.y
  })?.key
})

/**
 * Кольцо roving-фокуса в режиме сетки: ровно одна ячейка держит `tabindex=0`,
 * стрелки ходят по дням и неделям.
 *
 * Выключенные дни из обхода **не** выпадают: у них `aria-disabled`, а не
 * нативный `disabled`, и прыжок через них молча поменял бы семантику стрелок.
 */
const roving = useRovingFocus<string>({
  items: () => cellKeys.value,
  elementFor: key => dayEls.value.get(key),
  orientation: () => 'grid',
  // Семь дней в неделе против трёх периодов в ряду: примитив у сеток один,
  // разная у них только ширина.
  columns: () => (isDayMode.value ? 7 : 3),
  // Края сетки — не кольцо: за ними следующий и предыдущий месяцы.
  wrap: () => false,
  onOverflow: (edge) => {
    if (isLocked.value)
      return true
    // Стрелка вниз из последней недели листает месяц вперёд, вверх из
    // первой — назад. Клавишу гасим в любом случае: иначе прокрутится
    // страница под календарём.
    goToPeriod(edge === 'end' ? 1 : -1)
    return true
  },
  // Пока фокус не трогали, остановку держит выбранный день; если его в этом
  // месяце нет — первый день месяца, а не добор соседнего.
  initialKey: () => {
    if (!isDayMode.value)
      return selectedPeriodKey.value ?? cellKeys.value[0]

    const selected = props.modelValue
    if (selected && cellByKey.value.has(plainDateKey(selected)))
      return plainDateKey(selected)

    return grid.value.cells.find(cell => cell.inMonth)?.key
  },
})

/** Шаг листания: месяц, год или десятилетие — смотря что показываем. */
function shiftView(from: PlainDate, delta: number): PlainDate {
  if (props.mode === 'month')
    return addYears(from, delta)
  if (props.mode === 'year')
    return addYears(from, delta * 10)

  return addMonths(from, delta)
}

function goToPeriod(delta: number): void {
  if (isLocked.value)
    return

  const next = shiftView(viewDate.value, delta)
  if (!isPeriodReachable(next))
    return

  internalView.value = next
  emit('update:viewDate', next)
  emit('periodChange', next)

  // Смена периода стрелками для незрячего пользователя иначе беззвучна:
  // фокус переехал, а что именно изменилось — неизвестно.
  announce(
    props.mode === 'month'
      ? formatYearTitle(resolvedLocale.value, next.y)
      : props.mode === 'year'
        ? decadeLabel(next.y)
        : formatMonthTitle(resolvedLocale.value, next.y, next.m),
  )
}

/** Период достижим, если хотя бы один его день попадает в границы. */
function isPeriodReachable(view: PlainDate): boolean {
  const [first, last] = props.mode === 'day'
    ? [{ y: view.y, m: view.m, d: 1 }, { y: view.y, m: view.m, d: 31 }]
    : props.mode === 'month'
      ? [{ y: view.y, m: 0, d: 1 }, { y: view.y, m: 11, d: 31 }]
      : [{ y: decadeStart(view.y), m: 0, d: 1 }, { y: decadeStart(view.y) + 9, m: 11, d: 31 }]

  if (props.max && comparePlainDates(first, props.max) > 0)
    return false
  if (props.min && comparePlainDates(last, props.min) < 0)
    return false

  return true
}

const canGoBack = computed(() => !isLocked.value && isPeriodReachable(shiftView(viewDate.value, -1)))
const canGoForward = computed(() => !isLocked.value && isPeriodReachable(shiftView(viewDate.value, 1)))

/**
 * Выбор — событие, а не состояние: `aria-selected` меняется на ячейке, где
 * фокус уже стоит, и диктор об этом молчит. Без объявления клик и `Enter` для
 * незрячего пользователя неотличимы от ничего.
 *
 * Зовётся **после** возможного перевода показа: смена периода объявляет себя
 * сама, и объявленное раньше она бы затёрла.
 */
function announceSelected(date: PlainDate): void {
  if (!props.announceSelection)
    return

  announce(props.mode === 'year'
    ? formatYearTitle(resolvedLocale.value, date.y)
    : formatPlainDate(resolvedLocale.value, date, props.mode === 'month'
        ? { month: 'long', year: 'numeric' }
        : { dateStyle: 'long' }))
}

function selectPeriod(cell: PeriodCell): void {
  if (isLocked.value || cell.disabled)
    return

  emit('update:modelValue', cell.date)
  emit('change', cell.date)

  // Год из добора соседнего десятилетия переводит показ туда — как день из
  // добора соседнего месяца в дневной сетке.
  if (props.mode === 'year' && decadeStart(cell.date.y) !== decadeStart(viewDate.value.y)) {
    goToPeriod(cell.date.y > viewDate.value.y ? 1 : -1)
  }

  announceSelected(cell.date)
}

function selectCell(cell: CalendarCell): void {
  if (isLocked.value || cell.disabled)
    return

  // В режиме недели значение — её начало: форма модели остаётся общей для всех
  // режимов, и `valueAdapter` работает как работал.
  const value = isWeekMode.value ? startOfWeek(cell.date, resolvedWeekStart.value) : cell.date

  emit('update:modelValue', value)
  emit('change', value)

  // Клик по добору соседнего месяца переводит показ туда: иначе выбранный
  // день исчез бы из сетки сразу после выбора.
  if (!cell.inMonth)
    goToPeriod(comparePlainDates(cell.date, viewDate.value) > 0 ? 1 : -1)

  announceSelected(value)
}

/**
 * Можно ли выбрать эту дату — тем же правилом, каким сетка гасит ячейку.
 *
 * Подвал сетку обходит, поэтому спрашивает явно: иначе шорткат поставил бы
 * значение, до которого не дотянуться ни кликом, ни клавишей.
 */
function canSelectDate(date: PlainDate): boolean {
  return !isLocked.value && !isDisabledDate.value(date) && isPlainDateWithin(date, props.min, props.max)
}

/** Выбор из подвала. Возвращает `false`, если дата запрещена. */
function selectDate(date: PlainDate): boolean {
  if (!canSelectDate(date))
    return false

  emit('update:modelValue', date)
  emit('change', date)
  announceSelected(date)

  return true
}

function onDayClick(cell: CalendarCell): void {
  selectCell(cell)
  roving.setActive(cell.key)
}

function onPeriodClick(cell: PeriodCell): void {
  selectPeriod(cell)
  roving.setActive(cell.key)
}

function onGridKeydown(event: KeyboardEvent): void {
  if (isLocked.value)
    return

  // Листание месяцами и годами — до примитива: `PageUp`/`PageDown` он не знает,
  // а `Shift` для него модификатор, который он пропускает.
  if (event.key === 'PageUp' || event.key === 'PageDown') {
    event.preventDefault()
    const direction = event.key === 'PageDown' ? 1 : -1
    // `Shift` уводит на порядок крупнее: год в дневной сетке, десятилетие в
    // сетке месяцев, век в сетке лет.
    goToPeriod(event.shiftKey ? direction * (isDayMode.value ? 12 : 10) : direction)
    return
  }

  if (roving.handleNavigationKeys(event))
    return

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const key = roving.rovingKey.value
    if (!key)
      return

    if (isDayMode.value) {
      const cell = cellByKey.value.get(key)
      if (cell)
        selectCell(cell)
      return
    }

    const period = periodByKey.value.get(key)
    if (period)
      selectPeriod(period)
  }
}

function focus(): void {
  const key = roving.rovingKey.value
  if (key)
    dayEls.value.get(key)?.focus()
}

defineExpose({
  focus,
  goToPeriod,
  /** Перевести показ на месяц с этой датой и поставить на неё фокус. */
  focusDate: (date: PlainDate) => {
    if (!isPlainDateWithin(date, props.min, props.max))
      return
    internalView.value = date
    void roving.focusKey(plainDateKey(date))
  },
})
</script>

<template>
  <div
    data-gr-calendar
    :class="calendarRootClass"
    :aria-disabled="disabled ? 'true' : undefined"
    :data-allow-mismatch="viewFromClock ? 'children' : undefined"
  >
    <slot name="header" :title="periodTitle" :go-to-period="goToPeriod">
      <div :class="calendarHeaderClass" data-gr-calendar-header>
        <button
          type="button"
          data-gr-calendar-prev
          :class="[calendarNavButtonClass, calendarNavSizes[resolvedSize]]"
          :disabled="!canGoBack"
          :aria-label="isDayMode ? t('grChrono.calendar.previousMonth', 'Previous month') : t('grChrono.calendar.previousPeriod', 'Previous')"
          @click="goToPeriod(-1)"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <span :id="titleId" :class="calendarTitleClass" data-gr-calendar-title aria-live="off">
          {{ periodTitle }}
        </span>

        <button
          type="button"
          data-gr-calendar-next
          :class="[calendarNavButtonClass, calendarNavSizes[resolvedSize]]"
          :disabled="!canGoForward"
          :aria-label="isDayMode ? t('grChrono.calendar.nextMonth', 'Next month') : t('grChrono.calendar.nextPeriod', 'Next')"
          @click="goToPeriod(1)"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </slot>

    <!-- Сетка периодов: те же роли `grid`/`row`/`gridcell`, только рядов три
         по три ячейки, а не недели по семь дней. -->
    <div
      v-if="!isDayMode"
      :id="gridId"
      data-gr-calendar-periods
      role="grid"
      :class="mode === 'quarter' ? calendarQuarterGridClass : calendarPeriodGridClass"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabel ? undefined : titleId"
      :aria-readonly="readonly ? 'true' : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      @keydown="onGridKeydown"
    >
      <span
        v-for="cell in periodCells"
        :ref="element => setDayEl(cell.key, element)"
        :key="cell.key"
        role="gridcell"
        data-gr-calendar-period
        :data-key="cell.key"
        :tabindex="roving.tabindexFor(cell.key)"
        :aria-selected="cell.key === selectedPeriodKey ? 'true' : 'false'"
        :aria-disabled="cell.disabled ? 'true' : undefined"
        :aria-current="cell.current ? 'date' : undefined"
        :class="calendarPeriodClass({
          size: resolvedSize,
          selected: cell.key === selectedPeriodKey,
          current: cell.current,
          disabled: cell.disabled,
        })"
        @click="onPeriodClick(cell)"
      >
        {{ periodLabel(cell) }}
      </span>
    </div>

    <table
      v-else
      :id="gridId"
      data-gr-calendar-grid
      role="grid"
      :class="calendarGridClass"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabel ? undefined : titleId"
      :aria-readonly="readonly ? 'true' : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      @keydown="onGridKeydown"
      @mouseleave="emit('dayHover', null)"
    >
      <thead>
        <tr>
          <th v-if="resolvedShowWeekNumbers" scope="col" :class="calendarWeekNumberClass">
            <span class="sr-only">{{ t('grChrono.calendar.weekNumber', 'Week') }}</span>
          </th>
          <th
            v-for="column in weekdayColumns"
            :key="column.isoWeekday"
            scope="col"
            :class="calendarWeekdayClass"
            data-gr-calendar-weekday
          >
            <slot name="weekday" v-bind="column">
              <!-- Полное название — скринридеру: «пн» он прочёл бы по буквам. -->
              <abbr :title="column.full">{{ column.label }}</abbr>
            </slot>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="week in grid.weeks" :key="week.weekNumber" role="row">
          <th
            v-if="resolvedShowWeekNumbers"
            scope="row"
            :class="calendarWeekNumberClass"
            data-gr-calendar-week-number
          >
            {{ week.weekNumber }}
          </th>

          <td
            v-for="cell in week.days"
            :key="cell.key"
            role="gridcell"
            data-gr-calendar-cell
            :class="calendarRangeCellClass(rangeStateOf(cell))"
            :aria-selected="isSelected(cell) || rangeStateOf(cell).inRange ? 'true' : 'false'"
          >
            <span
              :ref="element => setDayEl(cell.key, element)"
              data-gr-calendar-day
              :data-key="cell.key"
              :tabindex="roving.tabindexFor(cell.key)"
              :aria-disabled="cell.disabled ? 'true' : undefined"
              :aria-current="cell.today ? 'date' : undefined"
              :class="calendarDayClass({
                size: resolvedSize,
                inMonth: cell.inMonth,
                today: cell.today,
                selected: isSelected(cell) || isEdge(cell),
                disabled: cell.disabled,
              })"
              @click="onDayClick(cell)"
              @mouseenter="emit('dayHover', cell.date)"
            >
              <slot name="day" :cell="cell" :selected="isSelected(cell)">
                {{ cell.date.d }}
              </slot>
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <slot name="footer" :select="selectDate" :can-select="canSelectDate" />
  </div>
</template>
