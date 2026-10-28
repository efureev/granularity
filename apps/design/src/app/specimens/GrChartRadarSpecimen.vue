<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedValue } from '@feugene/granularity'
import type { GrChartSeries } from '@feugene/granularity-charts'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'

const CRITERIA = ['Скорость', 'Цена', 'Поддержка', 'Надёжность', 'Документация']
const productSeries: GrChartSeries[] = [
  { id: 'ours', label: 'Наш продукт', x: CRITERIA, y: [8, 6, 9, 8, 7] },
  { id: 'rival', label: 'Конкурент', x: CRITERIA, y: [6, 9, 5, 7, 4] },
]

const PREVIEW_CRITERIA = ['Скорость', 'Цена', 'Сервис', 'Надёжность', 'Справка']
const previewSeries: GrChartSeries[] = productSeries.map(item => ({ ...item, x: PREVIEW_CRITERIA }))

const METRICS = ['Выручка, млн ₽', 'NPS', 'Конверсия, %', 'Удержание, %', 'Сделок']
const quarterSeries: GrChartSeries[] = [
  { id: 'q2', label: 'II квартал', x: METRICS, y: [4.2, 62, 3.1, 78, 240] },
  { id: 'q3', label: 'III квартал', x: METRICS, y: [5.8, 71, 4.4, 83, 310] },
]
const METRIC_LIMITS = { 'NPS': 100, 'Удержание, %': 100 }
const SCALES = ['per-axis', 'shared'] as const
const SCALE_OPTIONS: GrSegmentedOption[] = [
  { value: 'per-axis', label: 'На ось' },
  { value: 'shared', label: 'Общая' },
]
const scaleChoice = ref<GrSegmentedValue>('per-axis')
const axisScale = computed(() => SCALES.find(item => item === scaleChoice.value) ?? 'shared')
const scaleHint = computed(() => (axisScale.value === 'per-axis'
  ? 'У каждой спицы свой максимум — он стоит под её именем. Форма читается, площадь — нет.'
  : 'Общая шкала: сделки заняли её целиком, остальное схлопнулось у центра.'))

const HALF_YEAR = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь']
const engagementSeries: GrChartSeries[] = [
  { id: 'sales', label: 'Отдел продаж', x: HALF_YEAR, y: [7, 8, 6, 9, 7, 8] },
  { id: 'support', label: 'Поддержка', x: HALF_YEAR, y: [6, null, null, 8, 9, 7] },
]

const FRAMEWORKS = ['Vue', 'React', 'Svelte', 'Angular', 'Solid', 'Nuxt', 'Next', 'Astro']
const surveySeries: GrChartSeries[] = [
  { id: 'usage', label: 'Используют', x: FRAMEWORKS, y: [82, 74, 41, 38, 22, 46, 52, 31] },
  { id: 'interest', label: 'Хотят попробовать', x: FRAMEWORKS, y: [61, 55, 68, 24, 49, 51, 44, 57] },
  { id: 'retention', label: 'Продолжат', x: FRAMEWORKS, y: [88, 69, 76, 42, 58, 73, 61, 64] },
]
const GRID_SHAPES = ['polygon', 'circle'] as const
const GRID_OPTIONS: GrSegmentedOption[] = [
  { value: 'polygon', label: 'Многоугольник' },
  { value: 'circle', label: 'Окружности' },
]
const gridChoice = ref<GrSegmentedValue>('polygon')
const gridShape = computed(() => GRID_SHAPES.find(item => item === gridChoice.value) ?? 'polygon')
const surveyFill = ref(false)

const STATE_OPTIONS: GrSegmentedOption[] = [
  { value: 'data', label: 'Данные' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Нет данных' },
]
const chartState = ref<GrSegmentedValue>('data')
const emptyProductSeries = productSeries.map(item => ({ ...item, x: [], y: [] }))

const SKILLS = ['Vue', 'TypeScript', 'Тестирование', 'Доступность', 'Архитектура', 'Наставничество']
const candidateSeries: GrChartSeries[] = [
  { id: 'vacancy', label: 'Требования вакансии', x: SKILLS, y: [4, 4, 3, 3, 4, 2] },
  { id: 'candidate', label: 'Кандидат', x: SKILLS, y: [5, 4, 2, 4, 3, 3] },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrChartRadar
      :series="previewSeries"
      :height="112"
      :rings="3"
      :show-legend="false"
      aria-label="Наш продукт и конкурент по пяти критериям, баллы из 10"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Два профиля" note="Радар отвечает на «какой формы», а не «сколько»: наложенные контуры сравниваются одним взглядом. Точные значения — в тултипе и таблице.">
      <GrChartRadar
        :series="productSeries"
        :height="280"
        :y-domain="[0, 10]"
        aria-label="Наш продукт и конкурент по пяти критериям, баллы из 10"
      />
    </Specimen>

    <Specimen title="Шкала на ось" note="Миллионы, баллы и штуки общей шкалы не имеют. per-axis даёт каждой оси свой домен, axisMax — известный предел: без него NPS 71 сел бы на внешнее кольцо.">
      <GrSegmented v-model="scaleChoice" :options="SCALE_OPTIONS" size="sm" aria-label="Шкала осей" class="self-start" />
      <GrChartRadar
        :series="quarterSeries"
        :axis-scale="axisScale"
        :axis-max="METRIC_LIMITS"
        :height="280"
        aria-label="Метрики компании: II и III квартал"
      />
      <p :class="mutedClass">
        {{ scaleHint }}
      </p>
    </Specimen>

    <Specimen title="Пропуски" note="Пропуск рвёт контур и снимает заливку серии: замкнуть контур через пустую ось значит нарисовать ребро, которого нет.">
      <GrChartRadar
        :series="engagementSeries"
        :y-domain="[0, 10]"
        :height="280"
        aria-label="Индекс вовлечённости по отделам, январь — июнь"
        aria-description="В феврале и марте опрос в поддержке не проводили."
      />
      <p :class="mutedClass">
        В поддержке опрос в феврале и марте не проводили — значений нет, а ось осталась.
      </p>
    </Specimen>

    <Specimen title="Сетка и заливка" note="На трёх сериях заливки наслаиваются и рисунок мутнеет — её снимают, и различать остаются цвет, форма марки и штрих.">
      <div class="flex flex-wrap items-center gap-3">
        <GrSegmented v-model="gridChoice" :options="GRID_OPTIONS" size="sm" aria-label="Форма сетки" />
        <GrSwitch v-model="surveyFill" size="sm">
          Заливка
        </GrSwitch>
      </div>
      <GrChartRadar
        :series="surveySeries"
        :shape="gridShape"
        :fill="surveyFill"
        :y-domain="[0, 100]"
        :height="300"
        aria-label="Опрос разработчиков по фреймворкам, % ответов"
      />
    </Specimen>

    <Specimen title="Загрузка и нет данных" note="Скелет той же высоты; без значений — заглушка, паутина без данных не рисуется.">
      <GrSegmented v-model="chartState" :options="STATE_OPTIONS" size="sm" aria-label="Состояние диаграммы" class="self-start" />
      <GrChartRadar
        :series="chartState === 'empty' ? emptyProductSeries : productSeries"
        :loading="chartState === 'loading'"
        :height="280"
        empty-text="Оценок пока нет"
        aria-label="Наш продукт и конкурент по пяти критериям"
      />
    </Specimen>

    <Specimen title="В найме" note="Контур вакансии и контур кандидата: где перекрывает, где недотягивает — видно до чтения цифр.">
      <GrCard title="Анна Соколова" description="Фронтенд-разработчик · оценка после интервью" :heading-level="5" padding="md">
        <GrChartRadar
          :series="candidateSeries"
          :y-domain="[0, 5]"
          :rings="5"
          :height="280"
          aria-label="Компетенции кандидата против требований вакансии, баллы из 5"
          aria-description="Кандидат сильнее требований во Vue, доступности и наставничестве, слабее — в тестировании и архитектуре."
        />
      </GrCard>
    </Specimen>
  </div>
</template>
