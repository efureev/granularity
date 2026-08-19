<script setup lang="ts">
import { computed, ref, useTemplateRef, watchEffect } from 'vue'

/**
 * Приближение к участку длинного ряда.
 *
 * Ряд тот же, что у демонстрации прореживания, и это существенно: на полном
 * ряде мелкая рябь ложится сплошной штриховкой — бюджет даёт одну вершину на
 * семь точек. В суженном окне те же данные рисуются целиком, и рябь становится
 * различимой формой.
 */
const POINTS = 10_000

const series = [{
  id: 'cpu',
  label: 'Загрузка CPU',
  x: Array.from({ length: POINTS }, (_, index) => index),
  y: Array.from({ length: POINTS }, (_, index) => {
    const wave = Math.sin(index / 420) * 18 + Math.sin(index / 37) * 4
    const ripple = Math.sin(index / 3) * 1.6
    return Number((46 + wave + ripple).toFixed(2))
  }),
}]

const xWindow = ref<readonly [number, number] | null>(null)

const hours = (value: number) => `${Math.round(value / 60)} ч`

const bounds = computed(() => (
  xWindow.value === null
    ? 'весь ряд'
    : `${hours(xWindow.value[0])} — ${hours(xWindow.value[1])}`
))

/**
 * Скрытая таблица данных — переключателем, потому что решает это приложение.
 *
 * Строка на точку читаема, пока строк немного; на десяти тысячах такую таблицу
 * не читает подряд никто, а перестроение её стоит сотню миллисекунд.
 */
type TableMode = 'auto' | 'full' | 'off'

const tableMode = ref<TableMode>('auto')

const tableProps = computed(() => (
  tableMode.value === 'off'
    ? { dataTable: 'off' as const }
    : {
        dataTable: 'hidden' as const,
        dataTableMaxRows: tableMode.value === 'full' ? Number.POSITIVE_INFINITY : ('auto' as const),
      }
))

const tableHint: Record<TableMode, string> = {
  auto: 'Таблица печатает те же точки, что нарисованы, и говорит об этом пометкой в подвале. Стрелками по-прежнему доступны все.',
  full: 'Весь ряд строками в дереве доступности. Читать подряд его невозможно, а каждая смена окна перестраивает всё заново.',
  off: 'Таблицы нет вовсе. Данные остаются достижимы поточечно: стрелки обходят ряд и проговаривают каждую точку.',
}

const chartEl = useTemplateRef<HTMLElement>('chartEl')
const tableRows = ref(0)

watchEffect(() => {
  void tableMode.value
  void xWindow.value
  requestAnimationFrame(() => {
    tableRows.value = chartEl.value?.querySelectorAll('[data-gr-chart-table] tbody tr').length ?? 0
  })
})

const points = computed(() => (
  xWindow.value === null
    ? POINTS
    : Math.round(xWindow.value[1]) - Math.round(xWindow.value[0]) + 1
))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Показано: <strong>{{ bounds }}</strong>, точек: <strong>{{ points.toLocaleString('ru') }}</strong>
      </span>

      <GrButton size="sm" variant="outline" :disabled="xWindow === null" @click="xWindow = null">
        Весь ряд
      </GrButton>
    </div>

    <div ref="chartEl">
      <GrChartLine
        v-model:x-window="xWindow"
        v-bind="tableProps"
        :series="series"
        zoom="both"
        :height="260"
        :x-tick-format="hours"
        aria-label="Загрузка CPU за неделю"
      />
    </div>

    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Скрытая таблица для скринридера: строк <strong>{{ tableRows.toLocaleString('ru') }}</strong>
      </span>

      <GrSegmented
        v-model="tableMode"
        size="sm"
        :options="[
          { value: 'auto', label: 'Авто (по порогу)' },
          { value: 'full', label: 'Полная' },
          { value: 'off', label: 'Без таблицы' },
        ]"
        aria-label="Скрытая таблица данных"
      />
    </div>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ tableHint[tableMode] }}
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Протяните по холсту или покрутите колесо — окно сузится, и мелкая рябь из
      сплошной штриховки станет различимой формой: бюджет прореживания считается
      от ширины области, а точек в окне меньше, и на каждую приходится больше
      вершин. Окно выбирает <strong>данные</strong>,
      а не обрезает рисунок: <kbd>End</kbd> ведёт к последней видимой точке, а
      скрытая таблица печатает строки окна. С клавиатуры то же самое: <kbd>+</kbd>
      и <kbd>−</kbd> приближают к активной точке, <kbd>Shift</kbd> со стрелками
      сдвигает окно, <kbd>0</kbd> возвращает весь ряд.
    </p>
  </div>
</template>
