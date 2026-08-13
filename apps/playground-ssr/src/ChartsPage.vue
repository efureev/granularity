<script setup lang="ts">
import {
  GrChartArea,
  GrChartBar,
  GrChartLine,
  GrChartPie,
  GrSparkline,
} from '@feugene/granularity-charts'

/**
 * Companion-пакет `@feugene/granularity-charts` на сервере.
 *
 * Проверяются три вещи, каждая из которых видна только в связке «настоящий
 * серверный рендер + гидрация»:
 *
 *  1. **`ResizeObserver` в пути отрисовки.** Ширина холста замеряется
 *     `useElementSize`, а на сервере наблюдателя нет. Гард обязан работать
 *     режимом, а не отказом: раскладка уходит с сервера от **объявленной**
 *     ширины (`width`), и первый клиентский рендер обязан дать ту же — иначе
 *     каждая ось приедет расхождением. Уточнение после замера приходит
 *     обычным обновлением, уже после гидрации;
 *  2. **`useId()` в разметке.** Рама заводит `<clipPath>`, площадь —
 *     `<linearGradient>`, круг — `<pattern>`; все три адресуются по id. Совпасть
 *     они обязаны посимвольно: разойдись счётчик, и браузер обрежет график
 *     чужой маской либо не найдёт заливку вовсе;
 *  3. **`useAnnouncer` в setup.** Рама зовёт его при монтировании, а живой
 *     регион ставится в документ — на сервере документа нет.
 *
 * Часов пакет не читает **вовсе**: ось времени строится от значений в данных.
 * Поэтому `data-allow-mismatch` здесь не нужен нигде, и гейт обязан быть чист
 * целиком — в отличие от `ChronoPage`, где календарь без `today` вправе
 * разойтись.
 */
const days = Array.from({ length: 12 }, (_, index) => ({
  x: new Date(2026, 6, index + 1),
  y: 1200 + index * 90,
}))

const line = [{ id: 'sessions', label: 'Sessions', data: days }]

const stacked = [
  { id: 'retail', label: 'Retail', x: ['W1', 'W2', 'W3', 'W4'], y: [420, 460, 445, 510] },
  { id: 'partners', label: 'Partners', x: ['W1', 'W2', 'W3', 'W4'], y: [180, 190, 230, 210] },
]

const slices = [
  { label: 'Search', value: 4210 },
  { label: 'Direct', value: 1980 },
  { label: 'Social', value: 1240 },
  // Шестая доля повторила бы цвет первой, поэтому получает текстуру — а
  // текстура это `<pattern>` с id из `useId()`.
  { label: 'Mail', value: 620 },
  { label: 'Partners', value: 310 },
  { label: 'Other', value: 120 },
]

const spark = [12, 15, 14, 19, 22, 20, 26, 31]
</script>

<template>
  <main>
    <!-- Ось времени и маркеры: `<clipPath>` из `useId()`, замер ширины через
         `ResizeObserver`, живой регион от `useAnnouncer`. -->
    <GrChartLine :series="line" :width="640" :height="220" locale="en-US" aria-label="Sessions" />

    <!-- Градиент на серию — второй id из `useId()` в том же документе. -->
    <GrChartArea :series="line" :width="640" :height="220" locale="en-US" aria-label="Sessions area" />

    <!-- Стек считается в модели: разметка полос детерминирована данными. -->
    <GrChartArea
      :series="stacked"
      stacked
      :width="640"
      :height="220"
      locale="en-US"
      aria-label="Revenue by channel"
    />

    <GrChartBar
      :series="stacked"
      stacked="100%"
      :width="640"
      :height="220"
      locale="en-US"
      aria-label="Revenue share by channel"
    />

    <!-- Текстура шестой доли — `<pattern>`, третий вид id в разметке. -->
    <GrChartPie :data="slices" variant="donut" :width="640" :height="240" locale="en-US" aria-label="Traffic sources" />

    <!-- Рамы не использует вовсе: ни замера, ни живого региона — чистый SVG. -->
    <GrSparkline :data="spark" locale="en-US" />

    <!-- Неинтерактивный режим: поверхности нет, `<svg>` сам себе `role="img"`. -->
    <GrChartLine
      :series="line"
      :interactive="false"
      :width="640"
      :height="180"
      locale="en-US"
      aria-label="Sessions, static"
    />
  </main>
</template>
