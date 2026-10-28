<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import type { GrCalendarSize, PlainDate } from '@feugene/granularity-chrono'
import { addDays, comparePlainDates, formatPlainDate, isoWeekday, isSamePlainDate, plainDateKey } from '@feugene/granularity-chrono'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

// Месяц считается с нуля: { m: 9 } — октябрь. «Сегодня» задано пропом: с часами машины снимки и «Темы рядом» плыли бы каждый день.
const TODAY: PlainDate = { y: 2026, m: 9, d: 28 }

const SIZES: readonly GrCalendarSize[] = ['xs', 'sm', 'md', 'lg']

const cardDate = ref<PlainDate | null>({ y: 2026, m: 9, d: 30 })
const sizeDate = ref<PlainDate | null>({ y: 2026, m: 9, d: 30 })
const reportDate = ref<PlainDate | null>({ y: 2026, m: 9, d: 16 })

const visitDate = ref<PlainDate | null>({ y: 2026, m: 9, d: 30 })
const visitMax = addDays(TODAY, 30)

function isWeekend(date: PlainDate): boolean {
  return isoWeekday(date) >= 6
}

const PERIOD_MODES = ['week', 'month', 'quarter', 'year'] as const
type PeriodMode = typeof PERIOD_MODES[number]

// Выбранный период не совпадает с текущим: видны оба признака — заливка выбора и обводка «сейчас».
const periods = reactive<Record<PeriodMode, PlainDate | null>>({
  week: { y: 2026, m: 9, d: 19 },
  month: { y: 2026, m: 10, d: 1 },
  quarter: { y: 2026, m: 6, d: 1 },
  year: { y: 2027, m: 0, d: 1 },
})

const trip = reactive<{ start: PlainDate | null, end: PlainDate | null }>({
  start: { y: 2026, m: 9, d: 12 },
  end: { y: 2026, m: 9, d: 16 },
})
const tripHover = ref<PlainDate | null>(null)

function pickTripDay(date: PlainDate): void {
  if (trip.start && !trip.end) {
    const backwards = comparePlainDates(date, trip.start) < 0
    trip.end = backwards ? trip.start : date
    trip.start = backwards ? date : trip.start
    return
  }
  trip.start = date
  trip.end = null
}

const lessons = ref<PlainDate[]>([6, 13, 20, 27].map(d => ({ y: 2026, m: 9, d })))

function toggleLesson(date: PlainDate): void {
  lessons.value = lessons.value.some(item => isSamePlainDate(item, date))
    ? lessons.value.filter(item => !isSamePlainDate(item, date))
    : [...lessons.value, date].sort(comparePlainDates)
}

const localeDate = ref<PlainDate | null>({ y: 2026, m: 9, d: 30 })

const SIGNED_AT: PlainDate = { y: 2026, m: 9, d: 20 }
const ARCHIVED_AT: PlainDate = { y: 2026, m: 9, d: 9 }

// Дня нет в списке — записи на него нет, и сетка его выключает.
const FREE_WINDOWS: Record<string, number> = {
  '2026-10-28': 2,
  '2026-10-29': 4,
  '2026-10-30': 1,
  '2026-11-02': 5,
  '2026-11-03': 3,
  '2026-11-05': 2,
  '2026-11-06': 6,
  '2026-11-09': 4,
  '2026-11-10': 1,
  '2026-11-12': 3,
}

function windowsOn(date: PlainDate): number {
  return FREE_WINDOWS[plainDateKey(date)] ?? 0
}

function isBooked(date: PlainDate): boolean {
  return windowsOn(date) === 0
}

const WINDOW_FORMS: Record<string, string> = { one: 'окно', few: 'окна', many: 'окон', other: 'окна' }
const pluralRules = new Intl.PluralRules('ru-RU')

function windowsLabel(count: number): string {
  return `${count} ${WINDOW_FORMS[pluralRules.select(count)]}`
}

const booking = ref<PlainDate | null>({ y: 2026, m: 9, d: 29 })
const bookingTitle = computed(() => (booking.value
  ? formatPlainDate('ru-RU', booking.value, { weekday: 'long', day: 'numeric', month: 'long' })
  : 'День не выбран'))

const QUICK_DAYS = [
  { label: 'Сегодня', date: TODAY },
  { label: 'Завтра', date: addDays(TODAY, 1) },
  { label: 'В субботу', date: addDays(TODAY, 3) },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <!-- Месяц выше сцены карточки: он прижат к верху и теряет нижние недели, а не шапку. -->
  <div v-if="preview" class="min-h-0 w-full overflow-hidden">
    <GrCalendar v-model="cardDate" :today="TODAY" size="xs" aria-label="Дата доставки" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Ступени" note="Ячейка 28 · 32 · 36 · 40 px — не меньше 24 px по WCAG 2.2; месяц на md занимает около 290 px." wide>
      <div class="flex flex-wrap items-start gap-6">
        <div v-for="size in SIZES" :key="size" class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrCalendar v-model="sizeDate" :today="TODAY" :size="size" :aria-label="`Дата, ступень ${size}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Сегодня, выбор, соседние дни" note="Сегодня — обводка, выбор — заливка: состояние несёт форма, а не один цвет. Дни соседних месяцев приглушены, номера недель — по ISO.">
      <div>
        <GrCalendar v-model="reportDate" :today="TODAY" show-week-numbers aria-label="Дата отчёта" />
      </div>
    </Specimen>

    <Specimen title="Границы и запреты" note="Дни вне min и max и выходные из disabledDates видны, но не выбираются; за границу не листается — стрелка гаснет.">
      <div>
        <GrCalendar
          v-model="visitDate"
          :today="TODAY"
          :min="TODAY"
          :max="visitMax"
          :disabled-dates="isWeekend"
          aria-label="День визита"
        />
      </div>
    </Specimen>

    <Specimen title="Режимы" note="Неделя — та же сетка дней, выбор красит строку и кладёт её начало; месяц, квартал и год — сетка периодов, в модель уходит первое число." wide>
      <div class="flex flex-wrap items-start gap-6">
        <div v-for="mode in PERIOD_MODES" :key="mode" class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ mode }}
          </span>
          <GrCalendar v-model="periods[mode]" :mode="mode" :today="TODAY" size="sm" :aria-label="`Отчётный период, режим ${mode}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Период и набор" note="Сетка рисует отрезок и набор, но не считает их: порядок краёв, снятие и сортировку ведёт тот, кто её поставил, — пикер или экран.">
      <div class="flex flex-wrap items-start gap-6">
        <div class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            rangeStart · rangeEnd
          </span>
          <GrCalendar
            :model-value="null"
            :today="TODAY"
            :range-start="trip.start"
            :range-end="trip.end"
            :range-preview="trip.end ? null : tripHover"
            :announce-selection="false"
            size="sm"
            aria-label="Даты командировки"
            @update:model-value="pickTripDay"
            @day-hover="tripHover = $event"
          />
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            selectedDates
          </span>
          <GrCalendar
            :model-value="null"
            :today="TODAY"
            :selected-dates="lessons"
            size="sm"
            aria-label="Дни занятий"
            @update:model-value="toggleLesson"
          />
        </div>
      </div>
    </Specimen>

    <Specimen title="Неделя из локали" note="Первый день недели и названия дней приходят из Intl одним пропом locale: порознь их не меняют, иначе выйдет календарь, которого нет ни в одной стране.">
      <div class="flex flex-wrap items-start gap-6">
        <div class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ru-RU</span>
          <GrCalendar v-model="localeDate" :today="TODAY" locale="ru-RU" size="sm" aria-label="Дата, русская локаль" />
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">en-US</span>
          <GrCalendar v-model="localeDate" :today="TODAY" locale="en-US" size="sm" aria-label="Date, US locale" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Недоступно и только чтение" note="readonly оставляет выбор видимым и читаемым диктором, но не даёт его менять и листать; disabled гасит сетку целиком.">
      <div class="flex flex-wrap items-start gap-6">
        <div class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">readonly</span>
          <GrCalendar :model-value="SIGNED_AT" :today="TODAY" size="sm" readonly aria-label="Дата подписания договора" />
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">disabled</span>
          <GrCalendar :model-value="ARCHIVED_AT" :today="TODAY" size="sm" disabled aria-label="Дата архивации" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Своё в ячейке и подвал" note="Слот day дописывает в день пометку — здесь свободные окна; подвал получает select и canSelect, поэтому кнопка на занятый день приходит выключенной." wide>
      <div class="grid items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <GrCalendar
          v-model="booking"
          :today="TODAY"
          :min="TODAY"
          :disabled-dates="isBooked"
          aria-label="День записи в мастерскую"
        >
          <template #day="{ cell }">
            <span class="flex flex-col items-center gap-0.5">
              <span>{{ cell.date.d }}</span>
              <span
                class="h-1 w-1 rounded-[var(--gr-radius-full)]"
                :class="windowsOn(cell.date) > 0 && !cell.disabled ? 'bg-current' : ''"
                aria-hidden="true"
              />
              <span v-if="windowsOn(cell.date) > 0 && !cell.disabled" class="sr-only">свободно {{ windowsLabel(windowsOn(cell.date)) }}</span>
            </span>
          </template>
          <template #footer="{ select, canSelect }">
            <div class="flex flex-wrap items-center gap-1.5 border-t border-[var(--gr-brd)] pt-3">
              <GrButton
                v-for="quick in QUICK_DAYS"
                :key="quick.label"
                size="sm"
                variant="ghost"
                :disabled="!canSelect(quick.date)"
                @click="select(quick.date)"
              >
                {{ quick.label }}
              </GrButton>
            </div>
          </template>
        </GrCalendar>

        <div class="flex flex-col gap-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] p-4">
          <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            Запись в мастерскую
          </span>
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            {{ bookingTitle }}
          </span>
          <span v-if="booking" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Свободно {{ windowsLabel(windowsOn(booking)) }} по часу. Точка под числом — есть окна; дни без окон выключены.
          </span>
        </div>
      </div>
    </Specimen>
  </div>
</template>
