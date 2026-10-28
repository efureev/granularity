<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedValue } from '@feugene/granularity'
import type { GrChartReference, GrChartSeries, GrChartXWindow } from '@feugene/granularity-charts'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'

const WEEKS = Array.from({ length: 8 }, (_, index) => new Date(2026, 7, 31 + index * 7))
const channelSeries: GrChartSeries[] = [
  { id: 'retail', label: 'Розница', x: WEEKS, y: [420, 460, 445, 510, 495, 540, 560, 585] },
  { id: 'partners', label: 'Партнёры', x: WEEKS, y: [180, 190, 230, 210, 245, 260, 250, 290] },
  { id: 'api', label: 'API', x: WEEKS, y: [60, 75, 90, 120, 140, 165, 190, 230] },
]

const MODE_OPTIONS: GrSegmentedOption[] = [
  { value: 'stack', label: 'Стек' },
  { value: 'overlay', label: 'Наложение' },
  { value: 'share', label: '100 %' },
]
const mode = ref<GrSegmentedValue>('stack')
const stacked = computed<boolean | '100%'>(() => {
  if (mode.value === 'share')
    return '100%'
  return mode.value === 'stack'
})
const modeHint = computed(() => {
  if (mode.value === 'share')
    return 'Ось в процентах, но тултип и таблица называют рубли: нормируется рисунок, а не данные.'
  if (mode.value === 'overlay')
    return 'Каналы сами по себе: заливка градиентом, нижний ряд просвечивает.'
  return 'Верхний край — выручка целиком, высота полосы — вклад канала; заливка плотная, граница полос не размыта.'
})

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен']
const profitSeries: GrChartSeries[] = [{ id: 'profit', label: 'Прибыль', x: MONTHS, y: [-140, -95, -30, 25, 60, 40, 110, 165, 210] }]
const thousands = (value: number): string => `${value.toLocaleString('ru-RU')} тыс.`

const SESSIONS = [2140, 2210, 1760, 1610, 2290, 2380, 2330, 2410, 2460, 1880, 1700, 2390, 2450, 2520, 2610, 2540, 1960, 1790, 2490, 2580, 2650, 2700, 2620, 2050, 1880, 2690, 2740, 2710]
const sessionSeries: GrChartSeries[] = [{
  id: 'sessions',
  label: 'Сессии',
  data: SESSIONS.map((y, index) => ({ x: new Date(2026, 9, index + 1), y })),
}]
const sessionReferences: GrChartReference[] = [{ axis: 'y', value: 2400, label: 'План на день' }]

const STATE_OPTIONS: GrSegmentedOption[] = [
  { value: 'data', label: 'Данные' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Нет данных' },
]
const chartState = ref<GrSegmentedValue>('data')
const emptyChannelSeries = channelSeries.map(item => ({ ...item, x: [], y: [] }))

const HOURS = 30 * 24
const HOUR_X = Array.from({ length: HOURS }, (_, hour) => new Date(2026, 8, 1, hour))
function hourlyLoad(date: Date, base: number, swing: number): number {
  const daily = Math.max(0, Math.sin((date.getHours() - 6) / 24 * Math.PI * 2))
  const weekend = date.getDay() === 0 || date.getDay() === 6 ? 0.6 : 1
  return Math.round((base + daily * swing) * weekend + Math.sin(date.getTime() / 18_000_000) * base * 0.08)
}
const isCampaign = (date: Date): boolean => date.getDate() === 18 || date.getDate() === 19
const trafficSeries: GrChartSeries[] = [
  { id: 'organic', label: 'Органика', x: HOUR_X, y: HOUR_X.map(date => hourlyLoad(date, 120, 340)) },
  { id: 'ads', label: 'Реклама', x: HOUR_X, y: HOUR_X.map(date => hourlyLoad(date, 40, 160) + (isCampaign(date) ? 220 : 0)) },
]
const trafficWindow = ref<GrChartXWindow | null>(null)

const OCTOBER = Array.from({ length: 28 }, (_, index) => new Date(2026, 9, index + 1))
function dailyVisits(base: number, weekendDrop: number, growth: number): number[] {
  return OCTOBER.map((date, index) => {
    const weekend = date.getDay() === 0 || date.getDay() === 6 ? weekendDrop : 1
    return Math.round((base + index * growth) * weekend)
  })
}
const sourceSeries: GrChartSeries[] = [
  { id: 'search', label: 'Поиск', x: OCTOBER, y: dailyVisits(1420, 0.7, 9) },
  { id: 'direct', label: 'Прямые заходы', x: OCTOBER, y: dailyVisits(640, 0.8, 4) },
  { id: 'social', label: 'Соцсети', x: OCTOBER, y: dailyVisits(380, 1.2, 6) },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrChartArea
      :series="channelSeries"
      stacked
      :height="108"
      :y-tick-count="3"
      :show-legend="false"
      aria-label="Выручка по каналам за восемь недель, тыс. ₽"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Стек, наложение, доли" note="Три режима — три вопроса: из чего складывается целое, как каналы идут сами по себе и как менялись доли.">
      <GrSegmented v-model="mode" :options="MODE_OPTIONS" size="sm" aria-label="Режим площадей" class="self-start" />
      <GrChartArea
        :series="channelSeries"
        :stacked="stacked"
        :height="240"
        aria-label="Выручка по каналам за восемь недель, тыс. ₽"
      />
      <p :class="mutedClass">
        {{ modeHint }}
      </p>
    </Specimen>

    <Specimen title="Ниже нуля" note="База площади — ноль, а не низ холста: убыток уходит под ось и читается как минус.">
      <GrChartArea
        :series="profitSeries"
        :height="240"
        :y-tick-format="thousands"
        curve="smooth"
        aria-label="Операционная прибыль по месяцам, тыс. ₽"
      />
    </Specimen>

    <Specimen title="Объём и план" note="Один ряд с заливкой — «сколько набежало»; план — опора, а не серия: в легенде и строках таблицы его нет.">
      <GrChartArea
        :series="sessionSeries"
        :references="sessionReferences"
        :height="240"
        include-zero
        aria-label="Сессии по дням, октябрь"
      />
    </Specimen>

    <Specimen title="Загрузка и пустой период" note="Скелет той же высоты вместо площадей; пустой период — серии без точек и своя подпись вместо картинки.">
      <GrSegmented v-model="chartState" :options="STATE_OPTIONS" size="sm" aria-label="Состояние графика" class="self-start" />
      <GrChartArea
        :series="chartState === 'empty' ? emptyChannelSeries : channelSeries"
        :loading="chartState === 'loading'"
        stacked
        :height="240"
        empty-text="За выбранные недели выручки нет"
        aria-label="Выручка по каналам, тыс. ₽"
      />
    </Specimen>

    <Specimen title="Длинный стек и приближение" note="Семьсот часов на серию: стек прорежен по общему набору абсцисс, швов между полосами нет. Окно — протяжкой, колесом или клавишами + − 0." wide>
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <p :class="mutedClass">
          Трафик по часам, сентябрь. 18–19 сентября — рекламная кампания.
        </p>
        <GrButton size="sm" variant="outline" tone="neutral" :disabled="trafficWindow === null" @click="trafficWindow = null">
          Весь месяц
        </GrButton>
      </div>
      <GrChartArea
        v-model:x-window="trafficWindow"
        :series="trafficSeries"
        stacked
        zoom="both"
        :height="260"
        aria-label="Визиты по часам за сентябрь: органика и реклама"
        aria-description="18–19 сентября рекламный трафик почти удвоился."
      />
    </Specimen>

    <Specimen title="На дашборде" note="Карточка: итог числом сверху, состав по дням под ним." wide>
      <GrCard title="Трафик по источникам" description="1–28 октября, визиты в день" :heading-level="5" padding="md">
        <div class="flex flex-col gap-4">
          <GrStatistic title="Визитов за период" :value="71440" locale="ru-RU">
            <template #trend>
              <GrDelta :value="6.2" :precision="1" suffix="%" locale="ru-RU" show-arrow />
              <span>к сентябрю</span>
            </template>
          </GrStatistic>
          <GrChartArea
            :series="sourceSeries"
            stacked
            :height="240"
            legend-position="top"
            aria-label="Визиты по источникам, 1–28 октября"
          />
        </div>
      </GrCard>
    </Specimen>
  </div>
</template>
