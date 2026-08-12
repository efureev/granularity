<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useRovingFocus } from '@feugene/granularity/composables/useRovingFocus'
import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'

import type { CalendarCell, DisabledDatesInput } from '../../chrono/calendarGrid'
import { buildCalendarGrid, createDisabledPredicate } from '../../chrono/calendarGrid'
import { formatMonthTitle, localeFirstDayOfWeek, weekdayNames } from '../../chrono/chronoFormat'
import type { IsoWeekday, PlainDate } from '../../chrono/plainDate'
import {
  addMonths,
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
}

export interface GrCalendarEmits {
  (e: 'update:modelValue', value: PlainDate): void
  (e: 'update:viewDate', value: PlainDate): void
  (e: 'change', value: PlainDate): void
  /** Показываемый месяц сменился — листанием, клавиатурой или выбором. */
  (e: 'monthChange', value: PlainDate): void
}

const props = withDefaults(defineProps<GrCalendarProps>(), {
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
})

const emit = defineEmits<GrCalendarEmits>()

defineSlots<{
  /** Своя ячейка дня вместо числа. */
  day?: (props: { cell: CalendarCell, selected: boolean }) => unknown
  /** Своя шапка вместо заголовка и стрелок. */
  header?: (props: { title: string, goToMonth: (delta: number) => void }) => unknown
  /** Подвал панели: кнопки «сегодня», «очистить». */
  footer?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()
const { announce } = useAnnouncer()

const resolvedSize = useGrComponentSize<GrCalendarSize>(() => props.size, { component: 'GrCalendar' })
const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')
const resolvedWeekStart = computed(() => props.weekStart ?? localeFirstDayOfWeek(resolvedLocale.value))
const resolvedShowWeekNumbers = computed(() => props.showWeekNumbers ?? false)

const gridId = useId()
const titleId = useId()

/** Заблокирован целиком: ни выбора, ни листания. */
const isLocked = computed(() => props.disabled || props.readonly)

/**
 * Показываемый месяц. Управляемый через `viewDate` либо собственный —
 * контракт тот же, что у панельных оверлеев ядра.
 */
const internalView = ref<PlainDate | undefined>()

const viewDate = computed<PlainDate>(() => {
  const source = props.viewDate ?? internalView.value ?? props.modelValue ?? props.today ?? todayFallback()
  // Показывать месяц, целиком выпавший за границы, незачем.
  return clampPlainDate(source, props.min, props.max)
})

function todayFallback(): PlainDate {
  const now = new Date()
  return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() }
}

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

const monthTitle = computed(() => formatMonthTitle(resolvedLocale.value, viewDate.value.y, viewDate.value.m))
const weekdays = computed(() => weekdayNames(resolvedLocale.value, resolvedWeekStart.value))

/** Полные названия дней — в `abbr`, чтобы скринридер не читал «пн» по буквам. */
const weekdaysFull = computed(() => weekdayNames(resolvedLocale.value, resolvedWeekStart.value, 'long'))

function isSelected(cell: CalendarCell): boolean {
  return props.modelValue ? isSamePlainDate(cell.date, props.modelValue) : false
}

const dayEls = ref(new Map<string, HTMLElement>())

function setDayEl(key: string, element: unknown): void {
  if (element instanceof HTMLElement) dayEls.value.set(key, element)
  else dayEls.value.delete(key)
}

const cellByKey = computed(() => new Map(grid.value.cells.map(cell => [cell.key, cell])))

/**
 * Кольцо roving-фокуса в режиме сетки: ровно одна ячейка держит `tabindex=0`,
 * стрелки ходят по дням и неделям.
 *
 * Выключенные дни из обхода **не** выпадают: у них `aria-disabled`, а не
 * нативный `disabled`, и прыжок через них молча поменял бы семантику стрелок.
 */
const roving = useRovingFocus<string>({
  items: () => grid.value.cells.map(cell => cell.key),
  elementFor: key => dayEls.value.get(key),
  orientation: () => 'grid',
  columns: () => 7,
  // Края сетки — не кольцо: за ними следующий и предыдущий месяцы.
  wrap: () => false,
  onOverflow: (edge) => {
    if (isLocked.value) return true
    // Стрелка вниз из последней недели листает месяц вперёд, вверх из
    // первой — назад. Клавишу гасим в любом случае: иначе прокрутится
    // страница под календарём.
    goToMonth(edge === 'end' ? 1 : -1)
    return true
  },
  // Пока фокус не трогали, остановку держит выбранный день; если его в этом
  // месяце нет — первый день месяца, а не добор соседнего.
  initialKey: () => {
    const selected = props.modelValue
    if (selected && cellByKey.value.has(plainDateKey(selected))) return plainDateKey(selected)

    return grid.value.cells.find(cell => cell.inMonth)?.key
  },
})

function goToMonth(delta: number): void {
  if (isLocked.value) return

  const next = addMonths(viewDate.value, delta)
  if (!isMonthReachable(next)) return

  internalView.value = next
  emit('update:viewDate', next)
  emit('monthChange', next)

  // Смена месяца стрелками для незрячего пользователя иначе беззвучна:
  // фокус переехал, а что именно изменилось — неизвестно.
  announce(formatMonthTitle(resolvedLocale.value, next.y, next.m))
}

/** Месяц достижим, если хотя бы один его день попадает в границы. */
function isMonthReachable(month: PlainDate): boolean {
  const first: PlainDate = { y: month.y, m: month.m, d: 1 }
  const last: PlainDate = { y: month.y, m: month.m, d: 31 }

  if (props.max && comparePlainDates(first, props.max) > 0) return false
  if (props.min && comparePlainDates(last, props.min) < 0) return false

  return true
}

const canGoBack = computed(() => !isLocked.value && isMonthReachable(addMonths(viewDate.value, -1)))
const canGoForward = computed(() => !isLocked.value && isMonthReachable(addMonths(viewDate.value, 1)))

function selectCell(cell: CalendarCell): void {
  if (isLocked.value || cell.disabled) return

  emit('update:modelValue', cell.date)
  emit('change', cell.date)

  // Клик по добору соседнего месяца переводит показ туда: иначе выбранный
  // день исчез бы из сетки сразу после выбора.
  if (!cell.inMonth) goToMonth(comparePlainDates(cell.date, viewDate.value) > 0 ? 1 : -1)
}

function onDayClick(cell: CalendarCell): void {
  selectCell(cell)
  roving.setActive(cell.key)
}

function onGridKeydown(event: KeyboardEvent): void {
  if (isLocked.value) return

  // Листание месяцами и годами — до примитива: `PageUp`/`PageDown` он не знает,
  // а `Shift` для него модификатор, который он пропускает.
  if (event.key === 'PageUp' || event.key === 'PageDown') {
    event.preventDefault()
    const direction = event.key === 'PageDown' ? 1 : -1
    goToMonth(event.shiftKey ? direction * 12 : direction)
    return
  }

  if (roving.handleNavigationKeys(event)) return

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const key = roving.rovingKey.value
    const cell = key ? cellByKey.value.get(key) : undefined
    if (cell) selectCell(cell)
  }
}

function focus(): void {
  const key = roving.rovingKey.value
  if (key) dayEls.value.get(key)?.focus()
}

defineExpose({
  focus,
  goToMonth,
  /** Перевести показ на месяц с этой датой и поставить на неё фокус. */
  focusDate: (date: PlainDate) => {
    if (!isPlainDateWithin(date, props.min, props.max)) return
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
  >
    <slot name="header" :title="monthTitle" :go-to-month="goToMonth">
      <div :class="calendarHeaderClass" data-gr-calendar-header>
        <button
          type="button"
          data-gr-calendar-prev
          :class="[calendarNavButtonClass, calendarNavSizes[resolvedSize]]"
          :disabled="!canGoBack"
          :aria-label="t('gr.calendar.previousMonth', 'Previous month')"
          @click="goToMonth(-1)"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <span :id="titleId" :class="calendarTitleClass" data-gr-calendar-title aria-live="off">
          {{ monthTitle }}
        </span>

        <button
          type="button"
          data-gr-calendar-next
          :class="[calendarNavButtonClass, calendarNavSizes[resolvedSize]]"
          :disabled="!canGoForward"
          :aria-label="t('gr.calendar.nextMonth', 'Next month')"
          @click="goToMonth(1)"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </slot>

    <table
      :id="gridId"
      data-gr-calendar-grid
      role="grid"
      :class="calendarGridClass"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabel ? undefined : titleId"
      :aria-readonly="readonly ? 'true' : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      @keydown="onGridKeydown"
    >
      <thead>
        <tr>
          <th v-if="resolvedShowWeekNumbers" scope="col" :class="calendarWeekNumberClass">
            <span class="sr-only">{{ t('gr.calendar.weekNumber', 'Week') }}</span>
          </th>
          <th
            v-for="(weekday, index) in weekdays"
            :key="weekday"
            scope="col"
            :class="calendarWeekdayClass"
            data-gr-calendar-weekday
          >
            <!-- Полное название — скринридеру: «пн» он прочёл бы по буквам. -->
            <abbr :title="weekdaysFull[index]">{{ weekday }}</abbr>
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
            :aria-selected="isSelected(cell) ? 'true' : 'false'"
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
                selected: isSelected(cell),
                disabled: cell.disabled,
              })"
              @click="onDayClick(cell)"
            >
              <slot name="day" :cell="cell" :selected="isSelected(cell)">
                {{ cell.date.d }}
              </slot>
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <slot name="footer" />
  </div>
</template>
