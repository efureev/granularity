<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedValue } from '@feugene/granularity'
import type { GrChartReference, GrChartSeries } from '@feugene/granularity-charts'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'

const HALF_YEAR = ['Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт']
const orderSeries: GrChartSeries[] = [{ id: 'orders', label: 'Заказы', x: HALF_YEAR, y: [1240, 1310, 1185, 1420, 1560, 1690] }]

const QUARTERS = ['I кв.', 'II кв.', 'III кв.', 'IV кв.']
const planFactSeries: GrChartSeries[] = [
  { id: 'plan', label: 'План', x: QUARTERS, y: [4.2, 4.8, 5.1, 6.0] },
  { id: 'fact', label: 'Факт', x: QUARTERS, y: [3.9, 5.2, 4.7, 6.6] },
]
const dimInactive = ref(true)

const ticketSeries: GrChartSeries[] = [
  { id: 'bug', label: 'Ошибки', x: HALF_YEAR, y: [120, 138, 129, 142, 118, 96] },
  { id: 'howto', label: 'Как сделать', x: HALF_YEAR, y: [86, 92, 104, 121, 148, 173] },
  { id: 'billing', label: 'Оплата', x: HALF_YEAR, y: [40, 44, 39, 52, 61, 74] },
]
const STACK_OPTIONS: GrSegmentedOption[] = [
  { value: 'group', label: 'Рядом' },
  { value: 'stack', label: 'Стопкой' },
  { value: 'share', label: '100 %' },
]
const stackMode = ref<GrSegmentedValue>('stack')
const stacked = computed<boolean | '100%'>(() => {
  if (stackMode.value === 'share')
    return '100%'
  return stackMode.value === 'stack'
})
const stackHint = computed(() => {
  if (stackMode.value === 'group')
    return 'Рядом — сравнить типы между собой в каждом месяце.'
  if (stackMode.value === 'share')
    return 'Сто процентов — только структура: «как сделать» отъедает долю у ошибок.'
  return 'Стопкой — всего обращений за месяц и вклад каждого типа.'
})

const DEPARTMENTS = [
  'Клиентское обслуживание',
  'Разработка платформы',
  'Логистика и склад',
  'Финансы и отчётность',
  'Маркетинг и коммуникации',
  'Юридическая поддержка',
]
const departmentSeries: GrChartSeries[] = [
  { id: 'closed', label: 'Закрыто', x: DEPARTMENTS, y: [412, 388, 297, 214, 186, 92] },
  { id: 'open', label: 'В работе', x: DEPARTMENTS, y: [64, 121, 48, 39, 57, 28] },
]
const departmentReferences: GrChartReference[] = [{ axis: 'y', value: 350, label: 'План отдела' }]

const WEEKS = ['Нед. 36', 'Нед. 37', 'Нед. 38', 'Нед. 39', 'Нед. 40', 'Нед. 41', 'Нед. 42', 'Нед. 43']
const deltaSeries: GrChartSeries[] = [{ id: 'delta', label: 'Прирост к прошлой неделе', x: WEEKS, y: [-320, -140, 90, 210, -60, 340, 520, 410] }]

const STATE_OPTIONS: GrSegmentedOption[] = [
  { value: 'data', label: 'Данные' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Нет данных' },
]
const chartState = ref<GrSegmentedValue>('data')
const emptyTicketSeries = ticketSeries.map(item => ({ ...item, x: [], y: [] }))

const CATEGORIES = ['Электроника', 'Одежда', 'Дом и сад', 'Красота', 'Спорт', 'Детям']
const SALES: Record<string, readonly number[]> = {
  september: [8.4, 6.1, 4.8, 3.9, 2.7, 2.2],
  october: [9.2, 6.8, 4.5, 4.3, 2.4, 2.9],
}
const MONTH_OPTIONS: GrSegmentedOption[] = [
  { value: 'september', label: 'Сентябрь' },
  { value: 'october', label: 'Октябрь' },
]
const salesMonth = ref<GrSegmentedValue>('october')
const salesSeries = computed<GrChartSeries[]>(() => [{
  id: 'sales',
  label: 'Продажи, млн ₽',
  x: CATEGORIES,
  y: SALES[String(salesMonth.value)] ?? [],
}])
const salesLabel = computed(() => (salesMonth.value === 'september' ? 'сентябрь' : 'октябрь'))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrChartBar
      :series="orderSeries"
      :height="108"
      :y-tick-count="3"
      aria-label="Заказы по месяцам, май — октябрь"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Группа" note="Ось всегда от нуля: высота полосы и есть величина. Наведённая категория остаётся в цвете, соседние гаснут, а не исчезают — рисунок не едет.">
      <GrSwitch v-model="dimInactive" size="sm" class="self-start">
        Гасить остальные при наведении
      </GrSwitch>
      <GrChartBar
        :series="planFactSeries"
        :dim-inactive="dimInactive"
        :height="240"
        :value-format="{ precision: 1 }"
        aria-label="План и факт выручки по кварталам 2025 года, млн ₽"
      />
    </Specimen>

    <Specimen title="Стопка и доли" note="Группа отвечает «сколько у каждого», стопка — «из чего состоит». Тултип и таблица во всех режимах называют исходное число, а не долю.">
      <GrSegmented v-model="stackMode" :options="STACK_OPTIONS" size="sm" aria-label="Режим столбцов" class="self-start" />
      <GrChartBar
        :series="ticketSeries"
        :stacked="stacked"
        :height="240"
        aria-label="Обращения в поддержку по типам, май — октябрь"
      />
      <p :class="mutedClass">
        {{ stackHint }}
      </p>
    </Specimen>

    <Specimen title="Горизонталь" note="Длинные имена категорий читаются строкой. Оси называются по данным: опора axis: 'y' — ось значений, и здесь она вертикальна.">
      <GrChartBar
        :series="departmentSeries"
        orientation="horizontal"
        stacked
        :references="departmentReferences"
        :height="300"
        aria-label="Заявки по отделам за квартал"
      />
    </Specimen>

    <Specimen title="Ниже нуля" note="Полоса вниз — это минус, а не «столбец пониже»: скругляется только дальний от нуля конец.">
      <GrChartBar
        :series="deltaSeries"
        :height="240"
        aria-label="Прирост активных пользователей неделя к неделе"
      />
    </Specimen>

    <Specimen title="Загрузка и пустой период" note="Скелет держит высоту и место под оси; пустой период — серии без точек и своя подпись.">
      <GrSegmented v-model="chartState" :options="STATE_OPTIONS" size="sm" aria-label="Состояние графика" class="self-start" />
      <GrChartBar
        :series="chartState === 'empty' ? emptyTicketSeries : ticketSeries"
        :loading="chartState === 'loading'"
        stacked
        :height="240"
        empty-text="Обращений за период нет"
        aria-label="Обращения в поддержку по типам"
      />
    </Specimen>

    <Specimen title="В отчёте" note="Один ряд без легенды: подпись ряда уже в заголовке карточки. Месяц переключается в шапке.">
      <GrCard title="Продажи по категориям" description="Млн ₽ за месяц" :heading-level="5" padding="md">
        <template #actions>
          <GrSegmented v-model="salesMonth" :options="MONTH_OPTIONS" size="sm" aria-label="Месяц отчёта" />
        </template>
        <GrChartBar
          :series="salesSeries"
          :height="240"
          :value-format="{ precision: 1 }"
          :aria-label="`Продажи по категориям за ${salesLabel}, млн ₽`"
        />
      </GrCard>
    </Specimen>
  </div>
</template>
