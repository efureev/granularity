<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedValue } from '@feugene/granularity'
import { ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const PREVIEW_COHORTS = ['Июль', 'Август', 'Сентябрь', 'Октябрь']
const PREVIEW_MONTHS = ['M0', 'M1', 'M2', 'M3']
const PREVIEW_RETENTION = [
  [100, 67, 52, 46],
  [100, 58, 43],
  [100, 63],
  [100],
]

const COHORTS = ['Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь']
const OFFSETS = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5']
const RETENTION = [
  [100, 64, 48, 41, 38, 36],
  [100, 61, 45, 39, 35],
  [100, 67, 52, 46],
  [100, 58, 43],
  [100, 63],
  [100],
]
const percent = { precision: 0 }

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const DAYPARTS = ['Утро', 'День', 'Вечер', 'Ночь']
const LOAD_DEVIATION = [
  [12, 8, -4, 6, 14, -22, -31],
  [24, 19, 16, 22, 28, -8, -18],
  [6, 11, 9, 14, 32, 21, 4],
  [-14, -12, -16, -11, -2, 9, -6],
]
const STEP_OPTIONS: GrSegmentedOption[] = [
  { value: 5, label: '5 ступеней' },
  { value: 0, label: 'Непрерывно' },
]
const stepChoice = ref<GrSegmentedValue>(5)

const SERVICES = ['api-gateway', 'auth', 'billing', 'search', 'notify']
const VERSIONS = ['4.0', '4.1', '4.2', '4.3']
const ERROR_RATE = [
  [0.4, 0.3, 0.5, 0.3],
  [0.2, 0.2, 1.8, 0.3],
  [0.6, 0.5, 0.4, 0.4],
  [0.9, 1.4, 2.6, 3.1],
  [null, 0.7, 0.6, 0.5],
]

const STATE_OPTIONS: GrSegmentedOption[] = [
  { value: 'data', label: 'Данные' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Нет данных' },
]
const chartState = ref<GrSegmentedValue>('data')

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))
const TICKETS = WEEKDAYS.map((_, day) => HOURS.map((__, hour) => {
  const working = hour >= 9 && hour < 19
  const peak = Math.max(0, Math.sin(((hour - 9) / 10) * Math.PI)) * 34
  const weekend = day >= 5 ? 0.35 : 1
  const monday = day === 0 ? 1.25 : 1
  return Math.round(((working ? 8 : 2) + peak) * weekend * monday)
}))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrChartHeatmap
      :values="PREVIEW_RETENTION"
      :x-labels="PREVIEW_MONTHS"
      :y-labels="PREVIEW_COHORTS"
      :domain="[0, 100]"
      :height="84"
      aria-label="Удержание по когортам, %"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Когорты" note="null — «ещё не наступило», а не ноль: ячейка не заливается и в домен шкалы не входит. Легенда расшифровывает цвет — без неё его нечем прочитать.">
      <GrChartHeatmap
        :values="RETENTION"
        :x-labels="OFFSETS"
        :y-labels="COHORTS"
        :domain="[0, 100]"
        :value-format="percent"
        :height="260"
        aria-label="Удержание клиентов по месячным когортам, %"
        aria-description="Кривая выполаживается к третьему месяцу: дальше теряется по 2–4 пункта в месяц."
      />
    </Specimen>

    <Specimen title="Расходящаяся шкала" note="Недобор и перебор — разные роли вокруг середины; шкала симметрична по построению. Ступени читаются как зоны, непрерывная — как градиент.">
      <GrSegmented v-model="stepChoice" :options="STEP_OPTIONS" size="sm" aria-label="Шкала цвета" class="self-start" />
      <GrChartHeatmap
        :values="LOAD_DEVIATION"
        :x-labels="WEEKDAYS"
        :y-labels="DAYPARTS"
        scale="diverging"
        :midpoint="0"
        :steps="Number(stepChoice)"
        show-values
        :height="220"
        aria-label="Отклонение нагрузки от нормы по дням и времени суток, %"
      />
    </Specimen>

    <Specimen title="Одна роль" note="Шкала — примесь одной роли темы, а не пять подобранных цветов: доля ошибок красится ролью danger, тёмный режим подстраивается сам.">
      <GrChartHeatmap
        :values="ERROR_RATE"
        :x-labels="VERSIONS"
        :y-labels="SERVICES"
        :domain="[0, 4]"
        high-color="var(--gr-danger)"
        :value-format="{ precision: 1 }"
        :height="220"
        aria-label="Доля неуспешных ответов по сервисам и версиям, %"
        aria-description="search деградирует с каждой версией; auth дал всплеск в 4.2. notify в 4.0 не развёрнут."
      />
    </Specimen>

    <Specimen title="Загрузка и нет данных" note="Скелет той же высоты; без значений — заглушка со своей подписью.">
      <GrSegmented v-model="chartState" :options="STATE_OPTIONS" size="sm" aria-label="Состояние теплокарты" class="self-start" />
      <GrChartHeatmap
        :values="RETENTION"
        :x-labels="OFFSETS"
        :y-labels="COHORTS"
        :loading="chartState === 'loading'"
        :empty="chartState === 'empty'"
        :domain="[0, 100]"
        :height="260"
        empty-text="Когорт за период нет"
        aria-label="Удержание клиентов по месячным когортам, %"
      />
    </Specimen>

    <Specimen title="На дашборде" note="Сто шестьдесят восемь ячеек: числа появляются, только когда ячейка их вмещает; стрелки ходят по обеим осям и не кольцуются." wide>
      <GrCard title="Нагрузка на поддержку" description="Обращений в час, средняя неделя октября" :heading-level="5" padding="md">
        <GrChartHeatmap
          :values="TICKETS"
          :x-labels="HOURS"
          :y-labels="WEEKDAYS"
          :cell-gap="2"
          :height="240"
          aria-label="Обращения в поддержку по часам и дням недели"
          aria-description="Пик — с 12 до 16 часов в будни, самый тяжёлый день — понедельник."
        />
      </GrCard>
    </Specimen>
  </div>
</template>
