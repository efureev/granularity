<script setup lang="ts">
import { GrDelta } from '@feugene/granularity'

const rows = [
  { metric: 'Revenue', value: 8.4, polarity: 'positive-good' as const },
  { metric: 'Churn', value: 2.1, polarity: 'negative-good' as const },
  { metric: 'Response time', value: -15, polarity: 'negative-good' as const },
  { metric: 'Balance offset', value: -3.2, polarity: 'none' as const },
]
</script>

<template>
  <!--
    Полярность инвертирует тон, но не знак: «−15 %» времени отклика зелёное,
    потому что стало быстрее, — и всё ещё минус. Без этого компонент врал бы
    в половине случаев.
  -->
  <div class="grid gap-2 text-sm">
    <p v-for="row in rows" :key="row.metric">
      {{ row.metric }}:
      <GrDelta :value="row.value" :precision="1" suffix="%" :polarity="row.polarity" show-arrow />
      <!-- Не `opacity-*`: прозрачность разбавляет выверенный на AA токен и роняет контраст. -->
      <span class="text-[var(--gr-muted-fg)]">&#32;— polarity="{{ row.polarity }}"</span>
    </p>
  </div>
</template>
