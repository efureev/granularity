<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedValue } from '@feugene/granularity'
import type { GrChartPieSlice } from '@feugene/granularity-charts'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'

const SOURCES: GrChartPieSlice[] = [
  { label: 'Поиск', value: 4210 },
  { label: 'Прямые заходы', value: 1980 },
  { label: 'Соцсети', value: 1240 },
  { label: 'Почта', value: 620 },
  { label: 'Партнёры', value: 310 },
]
const sourcesTotal = SOURCES.reduce((sum, slice) => sum + (slice.value ?? 0), 0)

const VARIANTS = ['donut', 'pie'] as const
const VARIANT_OPTIONS: GrSegmentedOption[] = [
  { value: 'donut', label: 'Кольцо' },
  { value: 'pie', label: 'Круг' },
]
const variantChoice = ref<GrSegmentedValue>('donut')
const variant = computed(() => VARIANTS.find(item => item === variantChoice.value) ?? 'pie')
const activeSource = ref<number | null>(null)
const sourceReadout = computed(() => {
  const slice = activeSource.value === null ? undefined : SOURCES[activeSource.value]
  if (!slice || slice.value === null)
    return 'Наведите курсор на долю или нажмите стрелку'
  const share = (slice.value / sourcesTotal).toLocaleString('ru-RU', { style: 'percent', maximumFractionDigits: 0 })
  return `${slice.label}: ${slice.value.toLocaleString('ru-RU')} визитов · ${share}`
})

const BUDGET: GrChartPieSlice[] = [
  { label: 'Зарплаты', value: 62 },
  { label: 'Инфраструктура', value: 18 },
  { label: 'Маркетинг', value: 11 },
  { label: 'Обучение', value: 6 },
  { label: 'Прочее', value: 3 },
]
const LABEL_MODES = ['share', 'value', 'none'] as const
const LABEL_OPTIONS: GrSegmentedOption[] = [
  { value: 'share', label: 'Доля' },
  { value: 'value', label: 'Значение' },
  { value: 'none', label: 'Без подписей' },
]
const labelChoice = ref<GrSegmentedValue>('share')
const labels = computed(() => LABEL_MODES.find(item => item === labelChoice.value) ?? 'none')

const LANGUAGES: GrChartPieSlice[] = [
  { label: 'TypeScript', value: 38 },
  { label: 'Vue SFC', value: 24 },
  { label: 'CSS', value: 12 },
  { label: 'Markdown', value: 9 },
  { label: 'JSON', value: 7 },
  { label: 'Shell', value: 6 },
  { label: 'YAML', value: 4 },
]

const PAYMENTS: GrChartPieSlice[] = [
  { label: 'Карта', value: 6240 },
  { label: 'СБП', value: 2810 },
  { label: 'Наличные курьеру', value: null },
  { label: 'Бонусы', value: 640 },
  { label: 'Корректировка', value: -120 },
]

const STATE_OPTIONS: GrSegmentedOption[] = [
  { value: 'data', label: 'Данные' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Нет данных' },
]
const chartState = ref<GrSegmentedValue>('data')

const DELIVERIES: GrChartPieSlice[] = [
  { label: 'В срок', value: 1840 },
  { label: 'С опозданием до суток', value: 112 },
  { label: 'Позже суток', value: 48 },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrChartPie
      :data="SOURCES"
      variant="donut"
      :height="108"
      :show-legend="false"
      total-label="визитов"
      aria-label="Источники визитов за октябрь"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Кольцо и круг" note="В дырке кольца — итог. Легенда несёт значения и проценты и ничего не прячет: скрытая доля молча пересчитала бы остальные.">
      <GrSegmented v-model="variantChoice" :options="VARIANT_OPTIONS" size="sm" aria-label="Вид диаграммы" class="self-start" />
      <p :class="mutedClass">
        {{ sourceReadout }}
      </p>
      <GrChartPie
        v-model:active-index="activeSource"
        :data="SOURCES"
        :variant="variant"
        :height="240"
        total-label="визитов"
        aria-label="Источники визитов за октябрь"
      />
    </Specimen>

    <Specimen title="Подписи на выносках" note="Подписи стоят снаружи: внутри доли AA не держит ни один цвет текста. Доля ниже labelMinShare остаётся без подписи, но в тултипе и таблице она есть.">
      <GrSegmented v-model="labelChoice" :options="LABEL_OPTIONS" size="sm" aria-label="Подписи долей" class="self-start" />
      <GrChartPie
        :data="BUDGET"
        :labels="labels"
        :label-min-share="0.05"
        :show-legend="false"
        :height="240"
        aria-label="Структура расходов, % бюджета"
      />
    </Specimen>

    <Specimen title="Больше пяти долей" note="Ролей палитры пять: шестая и седьмая доли повторяют цвет и получают штриховку, иначе соседние доли читались бы одной.">
      <GrChartPie
        :data="LANGUAGES"
        variant="donut"
        :height="240"
        total-label="% строк"
        aria-label="Состав репозитория по языкам, % строк"
      />
    </Specimen>

    <Specimen title="Пропуск и минус" note="Пропуск и отрицательное значение на круг не попадают, модуль не берётся. В таблице строки остаются — с прочерком вместо доли.">
      <GrChartPie
        :data="PAYMENTS"
        variant="donut"
        :height="200"
        total-label="оплат"
        data-table="visible"
        aria-label="Оплаты по способам за октябрь"
      />
    </Specimen>

    <Specimen title="Загрузка и нет данных" note="Скелет круга той же высоты; без долей — заглушка со своей подписью.">
      <GrSegmented v-model="chartState" :options="STATE_OPTIONS" size="sm" aria-label="Состояние диаграммы" class="self-start" />
      <GrChartPie
        :data="chartState === 'empty' ? [] : SOURCES"
        :loading="chartState === 'loading'"
        variant="donut"
        :height="240"
        total-label="визитов"
        empty-text="Визитов за период нет"
        aria-label="Источники визитов за октябрь"
      />
    </Specimen>

    <Specimen title="Своё число в середине" note="Слот #center заменяет итог: в дырке — доля доставок в срок, а не сумма заказов.">
      <GrCard title="Доставка за октябрь" description="2 000 заказов" :heading-level="5" padding="md">
        <GrChartPie
          :data="DELIVERIES"
          variant="donut"
          :height="220"
          aria-label="Доставка за октябрь: в срок и с опозданием"
          aria-description="92 % заказов доставлены в срок."
        >
          <template #center="{ cx, cy, valueFont, labelFont }">
            <text
              :x="cx"
              :y="cy - labelFont / 2"
              :font-size="valueFont"
              fill="var(--gr-chart-pie-total,var(--gr-fg))"
              font-weight="600"
              text-anchor="middle"
              dominant-baseline="middle"
            >
92 %
</text>
            <text
              :x="cx"
              :y="cy + valueFont * 0.55"
              :font-size="labelFont"
              fill="var(--gr-chart-pie-total-label,var(--gr-muted-fg))"
              text-anchor="middle"
              dominant-baseline="middle"
            >
в срок
</text>
          </template>
        </GrChartPie>
      </GrCard>
    </Specimen>
  </div>
</template>
