<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedValue } from '@feugene/granularity'
import type { GrChartWaterfallStep } from '@feugene/granularity-charts'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'

const PREVIEW_STEPS: GrChartWaterfallStep[] = [
  { label: 'Было', value: 1240, kind: 'total' },
  { label: 'Новые', value: 364 },
  { label: 'Отток', value: -172 },
  { label: 'Стало', value: 1432, kind: 'total' },
]

const SUBSCRIPTIONS: GrChartWaterfallStep[] = [
  { label: 'На начало', value: 1240, kind: 'total' },
  { label: 'Новые', value: 318 },
  { label: 'Реактивации', value: 46 },
  { label: 'Заморозки', value: 0 },
  { label: 'Отток', value: -172 },
  { label: 'На конец', value: 1432, kind: 'total' },
]

const CREDITS: GrChartWaterfallStep[] = [
  { label: 'Обязательство на начало', value: 84_200, kind: 'total' },
  { label: 'Начислено по подпискам', value: 31_400 },
  { label: 'Куплено пакетами', value: 12_800 },
  { label: 'Списано за использование', value: -28_900 },
  { label: 'Сгорело по сроку', value: -6100 },
]
const ORIENTATIONS = ['horizontal', 'vertical'] as const
const ORIENTATION_OPTIONS: GrSegmentedOption[] = [
  { value: 'horizontal', label: 'Вбок' },
  { value: 'vertical', label: 'Вверх' },
]
const orientationChoice = ref<GrSegmentedValue>('horizontal')
const orientation = computed(() => ORIENTATIONS.find(item => item === orientationChoice.value) ?? 'vertical')

const MISMATCH: GrChartWaterfallStep[] = [
  { label: 'На начало', value: 1240, kind: 'total' },
  { label: 'Новые', value: 318 },
  { label: 'Отток', value: -172 },
  { label: 'На конец', value: 1420, kind: 'total' },
]

const REVENUE_BRIDGE: GrChartWaterfallStep[] = [
  { label: 'Сентябрь', value: 5.3, kind: 'total' },
  { label: 'Цена', value: 0.42 },
  { label: 'Объём', value: 0.31 },
  { label: 'Ассортимент', value: -0.12 },
  { label: 'Возвраты', value: -0.11 },
  { label: 'Октябрь', value: 5.8, kind: 'total' },
]
const millions = (value: number): string => `${value.toLocaleString('ru-RU')} млн`

const STATE_OPTIONS: GrSegmentedOption[] = [
  { value: 'data', label: 'Данные' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Нет данных' },
]
const chartState = ref<GrSegmentedValue>('data')

const CASH_FLOW: GrChartWaterfallStep[] = [
  { label: 'Остаток на начало', value: 12.4, kind: 'total' },
  { label: 'Оплаты клиентов', value: 8.6 },
  { label: 'Зарплаты', value: -4.9 },
  { label: 'Аренда', value: -1.2 },
  { label: 'Налоги', value: -1.8 },
  { label: 'Закупки', value: -2.3 },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrChartWaterfall
      :steps="PREVIEW_STEPS"
      :height="108"
      :y-tick-count="3"
      aria-label="Движение подписок за октябрь"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="От остатка к остатку" note="Цвет по знаку шага: прибавление, убавление, итог нейтрально. «Заморозки» с нулём — черта: «движения не было» — факт, и пропадать он не должен.">
      <GrChartWaterfall
        :steps="SUBSCRIPTIONS"
        :height="260"
        aria-label="Движение подписок за октябрь"
      />
    </Specimen>

    <Specimen title="Мост не сходится" note="Остатки kind: 'total' приходят с бэкенда как есть. Сумма движений с ними не сошлась — последний столбец не совпал с краем предыдущего шага.">
      <GrChartWaterfall
        :steps="MISMATCH"
        :height="260"
        aria-label="Движение подписок за сентябрь"
        aria-description="Сумма движений даёт 1 386, а остаток на конец — 1 420: расхождение 34 подписки."
      />
      <p :class="mutedClass">
        1 240 + 318 − 172 = 1 386, а на конец объявлено 1 420. Ошибку в данных видно глазом, а не в уме.
      </p>
    </Specimen>

    <Specimen title="Горизонталь и итог" note="Длинные имена шагов читаются строкой. showTotal дорисовывает итог от нуля; соединитель к нему не ведёт — он объявляет результат, а не продолжает мост." wide>
      <GrSegmented v-model="orientationChoice" :options="ORIENTATION_OPTIONS" size="sm" aria-label="Раскладка моста" class="self-start" />
      <GrChartWaterfall
        :steps="CREDITS"
        :orientation="orientation"
        show-total="Обязательство на конец"
        :height="300"
        aria-label="Экономика кредитов за октябрь"
      />
    </Specimen>

    <Specimen title="Разложение дельты" note="«Выручка выросла на полмиллиона» и четыре причины этого роста читаются как одна история.">
      <GrChartWaterfall
        :steps="REVENUE_BRIDGE"
        :height="260"
        :y-tick-format="millions"
        :value-format="{ precision: 2 }"
        aria-label="Выручка: от сентября к октябрю, млн ₽"
      />
    </Specimen>

    <Specimen title="Загрузка и нет данных" note="Скелет той же высоты; без шагов — заглушка со своей подписью.">
      <GrSegmented v-model="chartState" :options="STATE_OPTIONS" size="sm" aria-label="Состояние моста" class="self-start" />
      <GrChartWaterfall
        :steps="chartState === 'empty' ? [] : SUBSCRIPTIONS"
        :loading="chartState === 'loading'"
        :height="260"
        empty-text="Движений за период нет"
        aria-label="Движение подписок за октябрь"
      />
    </Specimen>

    <Specimen title="В отчёте" note="Денежный поток месяца: остаток на конец дорисован итогом, подпись которого — строка showTotal." wide>
      <GrCard title="Денежный поток" description="Октябрь, млн ₽" :heading-level="5" padding="md">
        <GrChartWaterfall
          :steps="CASH_FLOW"
          show-total="Остаток на конец"
          :height="280"
          :y-tick-format="millions"
          :value-format="{ precision: 1 }"
          aria-label="Денежный поток за октябрь, млн ₽"
          aria-description="Остаток за месяц снизился с 12,4 до 10,8 млн ₽: оплаты клиентов не покрыли расходы."
        />
      </GrCard>
    </Specimen>
  </div>
</template>
