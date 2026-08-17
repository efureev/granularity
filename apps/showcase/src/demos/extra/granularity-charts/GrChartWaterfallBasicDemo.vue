<script setup lang="ts">
/**
 * Мост отвечает на вопрос, которого нет у расходящихся столбцов: как из начала
 * месяца получился конец.
 *
 * Шаги `total` ставят реальные остатки с бэкенда, и если сумма движений с ними
 * не сходится, это видно глазом — последний столбец не совпадёт с вершиной
 * предпоследнего.
 */
const steps = [
  { label: 'На начало', value: 1240, kind: 'total' as const },
  { label: 'Новые', value: 318 },
  { label: 'Реактивации', value: 46 },
  { label: 'Заморозки', value: 0 },
  { label: 'Отток', value: -172 },
  { label: 'На конец', value: 1432, kind: 'total' as const },
]
</script>

<template>
  <div class="grid gap-3">
    <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Движение подписок за октябрь
    </span>

    <GrChartWaterfall
      :steps="steps"
      :height="280"
      aria-label="Движение подписок за октябрь"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Цвет идёт <strong>по знаку шага</strong>, а не по индексу серии: мост это один ряд, и различать
      в нём надо прибавление и убавление. «Заморозки» с нулём рисуются чертой — «движения не было»
      это факт, и пропадать он не должен.
    </p>
  </div>
</template>
