<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedValue } from '@feugene/granularity'
import type { GrChartCurve, GrChartReference, GrChartSeries, GrChartXWindow } from '@feugene/granularity-charts'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт']
const REVENUE = [3.1, 3.4, 3.9, 3.7, 4.2, 4.6, 4.4, 4.9, 5.3, 5.8]
const REVENUE_LAST_YEAR = [2.8, 2.9, 3.2, 3.3, 3.5, 3.6, 3.8, 4.0, 4.3, 4.6]

const previewSeries: GrChartSeries[] = [{ id: 'revenue', label: 'Выручка', x: MONTHS, y: REVENUE }]

const millions = (value: number): string => `${value.toLocaleString('ru-RU')} млн`

const HALF_YEAR = ['Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт']
const CITY_ORDERS: Record<string, readonly number[]> = {
  Москва: [42, 45, 44, 48, 51, 55],
  Петербург: [28, 30, 31, 30, 33, 35],
  Казань: [12, 13, 15, 16, 16, 18],
  Екатеринбург: [14, 14, 13, 15, 17, 17],
  Новосибирск: [9, 10, 11, 11, 12, 14],
  Онлайн: [20, 24, 27, 31, 36, 40],
}
const citySeries: GrChartSeries[] = Object.entries(CITY_ORDERS).map(([label, y], index) => ({
  id: `city-${index + 1}`,
  label,
  x: HALF_YEAR,
  y,
}))
const hiddenCities = ref<string[]>([])

const dayOfOctober = (day: number): Date => new Date(2026, 9, day)

const CURVES: readonly GrChartCurve[] = ['linear', 'smooth', 'step']
const CURVE_OPTIONS: GrSegmentedOption[] = CURVES.map(value => ({ value, label: value }))
const curveChoice = ref<GrSegmentedValue>('smooth')
const curve = computed(() => CURVES.find(item => item === curveChoice.value) ?? 'linear')
const ACTIVE_USERS = [1180, 1210, 1195, 1240, 1980, 2010, 1990, 2050, 2040, 2100, 2080, 2120, 2150, 2140]
const activeUsersSeries: GrChartSeries[] = [{
  id: 'dau',
  label: 'Активные пользователи',
  data: ACTIVE_USERS.map((y, index) => ({ x: dayOfOctober(index + 1), y })),
}]

const GAP_MODES = ['hidden', 'shadow', 'dashed'] as const
const GAP_OPTIONS: GrSegmentedOption[] = [
  { value: 'hidden', label: 'Разрыв' },
  { value: 'shadow', label: 'Тень' },
  { value: 'dashed', label: 'Штрих' },
]
const gapChoice = ref<GrSegmentedValue>('shadow')
const gaps = computed(() => GAP_MODES.find(item => item === gapChoice.value) ?? 'hidden')
const RACK_TEMPERATURE: (number | null)[] = [
  21.4,
  21.6,
  21.9,
  22.4,
  null,
  null,
  23.1,
  23.6,
  24.2,
  24.8,
  25.1,
  24.6,
  24.1,
  23.7,
  23.9,
  24.4,
  24.9,
  25.4,
  25.2,
  24.7,
  23.8,
  22.9,
  22.2,
  21.8,
]
const temperatureSeries: GrChartSeries[] = [{
  id: 'rack-a',
  label: 'Стойка A',
  data: RACK_TEMPERATURE.map((y, hour) => ({ x: new Date(2026, 9, 12, hour), y })),
}]
const celsius = (value: number): string => `${value.toFixed(0)} °C`

const LATENCY_P95 = [212, 218, 205, 224, 231, 226, 219, 214, 236, 241, 238, 229, 233, 252, 248, 244, 257, 266, 281, 342, 296, 263, 247, 238, 231, 226, 229, 221, 218, 214]
const latencySeries: GrChartSeries[] = [{
  id: 'p95',
  label: 'p95',
  data: LATENCY_P95.map((y, index) => ({ x: dayOfOctober(index + 1), y })),
}]
const latencyReferences: GrChartReference[] = [
  { axis: 'y', value: [180, 240], label: 'Рабочий коридор' },
  { axis: 'y', value: 300, label: 'SLA', dash: 'dash' },
  { axis: 'x', value: dayOfOctober(14), label: 'Релиз 4.2' },
]
const milliseconds = (value: number): string => `${value} мс`

const dualAxis = ref(true)
const subscriptionSeries: GrChartSeries[] = [
  { id: 'mrr', label: 'MRR, тыс. ₽', axis: 'right', x: HALF_YEAR, y: [3820, 3980, 4110, 4040, 4360, 4620] },
  { id: 'new', label: 'Новые', x: HALF_YEAR, y: [186, 204, 178, 231, 268, 294] },
  { id: 'churn', label: 'Отток', x: HALF_YEAR, y: [92, 88, 104, 96, 81, 74] },
]

const DAILY_REVENUE = [438, 466, 372, 349, 452, 471, 489, 503, 556, 401, 377, 462, 488, 512]
const DAILY_ORDERS = [101, 108, 86, 79, 104, 109, 113, 117, 131, 92, 85, 107, 113, 119]
const dailyRevenueSeries: GrChartSeries[] = [{
  id: 'revenue',
  label: 'Выручка, тыс. ₽',
  data: DAILY_REVENUE.map((y, index) => ({ x: dayOfOctober(index + 1), y })),
}]
const dailyOrdersSeries: GrChartSeries[] = [{
  id: 'orders',
  label: 'Заказы',
  data: DAILY_ORDERS.map((y, index) => ({ x: dayOfOctober(index + 1), y })),
}]
const sharedCursor = ref<number | null>(null)
const cursorReadout = computed(() => {
  const index = sharedCursor.value
  if (index === null || DAILY_REVENUE[index] === undefined)
    return 'Наведите курсор на любой из графиков или нажмите стрелку'
  const date = dayOfOctober(index + 1).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  return `${date}: ${DAILY_REVENUE[index]} тыс. ₽ · ${DAILY_ORDERS[index]} заказов`
})

const STATES = ['data', 'loading', 'empty'] as const
const STATE_OPTIONS: GrSegmentedOption[] = [
  { value: 'data', label: 'Данные' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Нет данных' },
]
const stateChoice = ref<GrSegmentedValue>('data')
const chartState = computed(() => STATES.find(item => item === stateChoice.value) ?? 'data')
const showTable = ref(false)
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const requestSeries: GrChartSeries[] = [
  { id: 'incoming', label: 'Поступило', x: WEEKDAYS, y: [64, 71, 68, 75, 59, 22, 18] },
  { id: 'closed', label: 'Закрыто', x: WEEKDAYS, y: [58, 66, 70, 72, 63, 20, 15] },
]
const emptyRequestSeries = computed(() => requestSeries.map(item => ({ ...item, x: [], y: [] })))

const CPU_START = new Date(2026, 9, 26).getTime()
const CPU_POINTS = 3 * 24 * 60
const cpuSeries: GrChartSeries[] = [{
  id: 'cpu',
  label: 'Загрузка CPU, %',
  x: Array.from({ length: CPU_POINTS }, (_, minute) => new Date(CPU_START + minute * 60_000)),
  y: Array.from({ length: CPU_POINTS }, (_, minute) => {
    const daily = Math.sin((minute / 1440) * Math.PI * 2 - Math.PI / 2) * 18
    const ripple = Math.sin(minute / 7) * 3 + Math.sin(minute / 41) * 4
    const deploy = minute >= 2310 && minute < 2350 ? 28 : 0
    return Number((44 + daily + ripple + deploy).toFixed(1))
  }),
}]
const cpuWindow = ref<GrChartXWindow | null>(null)
const windowLabel = computed(() => {
  if (cpuWindow.value === null)
    return 'весь ряд, 3 суток'
  const format = (value: number): string => new Date(value).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return `${format(cpuWindow.value[0])} — ${format(cpuWindow.value[1])}`
})

const sceneSeries: GrChartSeries[] = [
  { id: 'this-year', label: '2026', x: MONTHS, y: REVENUE },
  { id: 'last-year', label: '2025', x: MONTHS, y: REVENUE_LAST_YEAR, dash: 'dash' },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrChartLine
      :series="previewSeries"
      :height="108"
      :y-tick-count="3"
      :y-tick-format="millions"
      curve="smooth"
      aria-label="Выручка по месяцам 2026 года, млн ₽"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Ряды и легенда" note="Шестой ряд повторяет цвет первого, но отличается формой точки: цвет — не единственный различитель. Легенда только просит скрыть ряд, применяет v-model:hiddenSeries.">
      <GrChartLine
        v-model:hidden-series="hiddenCities"
        :series="citySeries"
        :height="240"
        show-points="always"
        aria-label="Заказы по городам за полгода, тыс."
      />
    </Specimen>

    <Specimen title="Форма линии" note="smooth — монотонная кубика: на скачке после релиза она не уходит за соседние значения; step — для величин, которые менялись ступенями.">
      <GrSegmented v-model="curveChoice" :options="CURVE_OPTIONS" size="sm" aria-label="Форма линии" class="self-start" />
      <GrChartLine
        :series="activeUsersSeries"
        :curve="curve"
        :height="220"
        aria-label="Активные пользователи по дням, 1–14 октября"
      />
    </Specimen>

    <Specimen title="Пропуски" note="null рвёт линию, а не рисует ноль. Перемычка тенью или штрихом всегда прямая и на измеренную линию не похожа.">
      <GrSegmented v-model="gapChoice" :options="GAP_OPTIONS" size="sm" aria-label="Как показать пропуск" class="self-start" />
      <GrChartLine
        :series="temperatureSeries"
        :gaps="gaps"
        :height="220"
        :y-tick-format="celsius"
        aria-label="Температура в серверной, стойка A, 12 октября"
        aria-description="С 4:00 до 6:00 датчик был отключён на обслуживание."
      />
      <p :class="mutedClass">
        С 4:00 до 6:00 датчик был на обслуживании — замеров нет.
      </p>
    </Specimen>

    <Specimen title="Опоры" note="Коридор, SLA и дата релиза — проп references, а не серии: в легенду, домен оси и строки таблицы они не попадают.">
      <GrChartLine
        :series="latencySeries"
        :references="latencyReferences"
        :height="240"
        :y-tick-format="milliseconds"
        aria-label="Время ответа API, p95, октябрь"
        aria-description="20 октября p95 вышел за SLA в 300 мс."
      />
    </Specimen>

    <Specimen title="Две оси" note="Деньги и штуки читаются вместе только на двух осях. Включение осознанное: без dualAxis поле axis у серии не действует, и подписки ложатся у нуля.">
      <GrSwitch v-model="dualAxis" size="sm" class="self-start">
        Вторая ось
      </GrSwitch>
      <GrChartLine
        :series="subscriptionSeries"
        :dual-axis="dualAxis"
        :height="240"
        aria-label="MRR и движение подписок за полгода"
      />
    </Specimen>

    <Specimen title="Пара с общим курсором" note="activeIndex — v-model: курсор одного графика ставит ту же дату во втором. У второго панель тултипа снята, курсор остался.">
      <p :class="mutedClass">
        {{ cursorReadout }}
      </p>
      <GrChartLine
        v-model:active-index="sharedCursor"
        :series="dailyRevenueSeries"
        :height="150"
        aria-label="Выручка по дням, 1–14 октября, тыс. ₽"
      />
      <GrChartLine
        v-model:active-index="sharedCursor"
        :series="dailyOrdersSeries"
        :height="120"
        :tooltip="false"
        aria-label="Заказы по дням, 1–14 октября"
      />
    </Specimen>

    <Specimen title="Загрузка, пустой период, таблица" note="Скелет держит высоту и ставит aria-busy; пустой период — объявленные серии без точек. Таблица данных та же, что читает скринридер.">
      <div class="flex flex-wrap items-center gap-3">
        <GrSegmented v-model="stateChoice" :options="STATE_OPTIONS" size="sm" aria-label="Состояние графика" />
        <GrSwitch v-model="showTable" size="sm">
          Таблица данных
        </GrSwitch>
      </div>
      <GrChartLine
        :series="chartState === 'empty' ? emptyRequestSeries : requestSeries"
        :loading="chartState === 'loading'"
        :data-table="showTable ? 'visible' : 'hidden'"
        :height="220"
        empty-text="За эту неделю заявок нет"
        aria-label="Заявки в поддержку за неделю"
      />
    </Specimen>

    <Specimen title="Длинный ряд и приближение" note="Четыре тысячи замеров: рисунок прорежен до двух вершин на пиксель, курсор и таблица знают весь ряд. Окно выбирает данные — протяжка, колесо или клавиши + − 0." wide>
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <p :class="mutedClass">
          Показано: {{ windowLabel }}
        </p>
        <GrButton size="sm" variant="outline" tone="neutral" :disabled="cpuWindow === null" @click="cpuWindow = null">
          Весь ряд
        </GrButton>
      </div>
      <GrChartLine
        v-model:x-window="cpuWindow"
        :series="cpuSeries"
        zoom="both"
        :height="260"
        aria-label="Загрузка CPU по минутам, 26–28 октября"
        aria-description="27 октября около 14:30 — всплеск на время выкладки."
      />
    </Specimen>

    <Specimen title="В отчёте" note="Прошлый год — штрихом на самой серии: сравнение читается без второго графика." wide>
      <GrCard title="Выручка" description="Январь — октябрь, млн ₽" :heading-level="5" padding="md">
        <div class="flex flex-col gap-4">
          <GrStatistic title="С начала года" :value="43.3" :precision="1" suffix="млн ₽" locale="ru-RU">
            <template #trend>
              <GrDelta :value="18.4" :precision="1" suffix="%" locale="ru-RU" show-arrow />
              <span>к 2025 году</span>
            </template>
          </GrStatistic>
          <GrChartLine
            :series="sceneSeries"
            :height="240"
            :y-tick-format="millions"
            :value-format="{ precision: 1 }"
            curve="smooth"
            legend-position="top"
            aria-label="Выручка по месяцам: 2026 и 2025 годы, млн ₽"
          />
        </div>
      </GrCard>
    </Specimen>
  </div>
</template>
