<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedValue } from '@feugene/granularity'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
const labelClass = 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]'

interface BulletMetric {
  label: string
  value: number | null
  target: number
  ranges: readonly number[]
  max: number
  shown?: string
}

const PREVIEW_METRICS: BulletMetric[] = [
  { label: 'Выручка, млн ₽', value: 5.8, target: 6, ranges: [4.5, 5.5], max: 7 },
  { label: 'Новые клиенты', value: 318, target: 300, ranges: [200, 280], max: 400 },
]

const PRODUCT_METRICS: BulletMetric[] = [
  { label: 'Конверсия в оплату, %', value: 12.4, target: 15, ranges: [8, 12], max: 20 },
  { label: 'Удержание через месяц, %', value: 64, target: 60, ranges: [40, 55], max: 80 },
  { label: 'NPS', value: 41, target: 50, ranges: [20, 40], max: 70 },
]

const COST_METRICS: BulletMetric[] = [
  { label: 'Себестоимость кредита, ₽', value: 3.1, target: 4, ranges: [3, 4], max: 5 },
  { label: 'Время ответа поддержки, ч', value: 6.2, target: 4, ranges: [4, 8], max: 12 },
  { label: 'Доля возвратов, %', value: 2.4, target: 3, ranges: [2, 4], max: 6 },
]
const RISK_COLORS = ['var(--gr-success)', 'var(--gr-warning)', 'var(--gr-danger)']

const STATES = { normal: 3.1, missing: null, overflow: 7.4 } as const
const STATE_OPTIONS: GrSegmentedOption[] = [
  { value: 'normal', label: 'В норме' },
  { value: 'missing', label: 'Нет значения' },
  { value: 'overflow', label: 'За шкалой' },
]
const stateChoice = ref<GrSegmentedValue>('missing')
const stateValue = computed(() => {
  if (stateChoice.value === 'missing')
    return STATES.missing
  return stateChoice.value === 'overflow' ? STATES.overflow : STATES.normal
})
const stateHint = computed(() => {
  if (stateChoice.value === 'missing')
    return 'Списаний не было — нет и себестоимости. Полосы нет, цель на месте, в таблице прочерк; роль meter снята — без aria-valuenow она невалидна.'
  if (stateChoice.value === 'overflow')
    return 'Полоса упирается в край и получает маркер переполнения; настоящие 7,4 ₽ — в тултипе, таблице и объявлении.'
  return 'Полоса внутри шкалы, цель рядом.'
})

const WAREHOUSES: BulletMetric[] = [
  { label: 'Москва', value: 87, target: 85, ranges: [70, 90], max: 100, shown: '87 %' },
  { label: 'Казань', value: 64, target: 85, ranges: [70, 90], max: 100, shown: '64 %' },
  { label: 'Екатеринбург', value: 93, target: 85, ranges: [70, 90], max: 100, shown: '93 %' },
  { label: 'Новосибирск', value: 78, target: 85, ranges: [70, 90], max: 100, shown: '78 %' },
]

const loading = ref(false)

const SALES_GOALS: BulletMetric[] = [
  { label: 'Выручка', value: 5.8, target: 6, ranges: [4.5, 5.5], max: 7, shown: '5,8 из 6 млн ₽' },
  { label: 'Новые клиенты', value: 318, target: 300, ranges: [200, 280], max: 400, shown: '318 из 300' },
  { label: 'Средний чек', value: 13.2, target: 14, ranges: [11, 13], max: 16, shown: '13,2 из 14 тыс. ₽' },
  { label: 'Конверсия', value: 2.9, target: 3.2, ranges: [2, 2.8], max: 4, shown: '2,9 из 3,2 %' },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-2">
    <div v-for="metric in PREVIEW_METRICS" :key="metric.label" class="grid gap-0.5">
      <span :class="mutedClass">{{ metric.label }}</span>
      <GrChartBullet
        :value="metric.value"
        :target="metric.target"
        :ranges="metric.ranges"
        :max="metric.max"
        :label="metric.label"
        :height="32"
      />
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Метрики подряд" note="Диапазоны — фон, значение — узкая полоса, цель — засечка поперёк. Строка на метрику, и десяток метрик сравнивается по вертикали.">
      <div v-for="metric in PRODUCT_METRICS" :key="metric.label" class="grid gap-1">
        <span :class="labelClass">{{ metric.label }}</span>
        <GrChartBullet
          :value="metric.value"
          :target="metric.target"
          :ranges="metric.ranges"
          :max="metric.max"
          :label="metric.label"
          :height="44"
        />
      </div>
    </Specimen>

    <Specimen title="Свои цвета диапазонов" note="rangeColors идут от «хорошо» к «плохо» — для метрик, где меньше значит лучше. Цвета — роли темы, полос на одну больше, чем границ.">
      <div v-for="metric in COST_METRICS" :key="metric.label" class="grid gap-1">
        <span :class="labelClass">{{ metric.label }}</span>
        <GrChartBullet
          :value="metric.value"
          :target="metric.target"
          :ranges="metric.ranges"
          :max="metric.max"
          :range-colors="RISK_COLORS"
          :label="metric.label"
          :height="44"
        />
      </div>
    </Specimen>

    <Specimen title="Нет значения и за шкалой" note="null — не ноль, а значение за шкалой не обрезается молча: оба случая нарисовали бы число, которого в данных нет.">
      <GrSegmented v-model="stateChoice" :options="STATE_OPTIONS" size="sm" aria-label="Состояние метрики" class="self-start" />
      <GrChartBullet
        :value="stateValue"
        :target="4"
        :ranges="[3, 4]"
        :max="5"
        :range-colors="RISK_COLORS"
        label="Себестоимость кредита, ₽"
        :height="48"
        data-table="visible"
      />
      <p :class="mutedClass">
        {{ stateHint }}
      </p>
    </Specimen>

    <Specimen title="Вертикаль" note="Дорожки стоят столбиками: склады сравниваются по высоте, засечка цели — на одном уровне у всех.">
      <div class="grid grid-cols-4 gap-4">
        <div v-for="metric in WAREHOUSES" :key="metric.label" class="flex min-w-0 flex-col items-center gap-1">
          <GrChartBullet
            :value="metric.value"
            :target="metric.target"
            :ranges="metric.ranges"
            :max="metric.max"
            :label="`Заполненность склада, ${metric.label}`"
            orientation="vertical"
            :height="180"
          />
          <span :class="labelClass" class="max-w-full truncate">{{ metric.label }}</span>
          <span :class="mutedClass">{{ metric.shown }}</span>
        </div>
      </div>
    </Specimen>

    <Specimen title="Загрузка" note="Скелет той же высоты: строка метрики не прыгает, корень помечен aria-busy.">
      <GrSwitch v-model="loading" size="sm" class="self-start">
        Данные загружаются
      </GrSwitch>
      <div v-for="metric in PRODUCT_METRICS" :key="metric.label" class="grid gap-1">
        <span :class="labelClass">{{ metric.label }}</span>
        <GrChartBullet
          :value="metric.value"
          :target="metric.target"
          :ranges="metric.ranges"
          :max="metric.max"
          :label="metric.label"
          :loading="loading"
          :height="44"
        />
      </div>
    </Specimen>

    <Specimen title="Цели месяца" note="Число и цель словами справа, полоса — насколько до следующей границы. Вместо четырёх циферблатов — четыре строки.">
      <GrCard title="Отдел продаж" description="Октябрь, план и факт" :heading-level="5" padding="md">
        <div class="flex flex-col gap-4">
          <div v-for="metric in SALES_GOALS" :key="metric.label" class="grid gap-1">
            <div class="flex items-baseline justify-between gap-3">
              <span :class="labelClass">{{ metric.label }}</span>
              <span :class="mutedClass">{{ metric.shown }}</span>
            </div>
            <GrChartBullet
              :value="metric.value"
              :target="metric.target"
              :ranges="metric.ranges"
              :max="metric.max"
              :label="metric.label"
              :height="36"
            />
          </div>
        </div>
      </GrCard>
    </Specimen>
  </div>
</template>
