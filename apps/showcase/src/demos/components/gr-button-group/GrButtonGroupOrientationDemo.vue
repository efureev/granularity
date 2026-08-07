<script setup lang="ts">
import { GrButton, GrButtonGroup } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-start gap-8">
    <GrButtonGroup aria-label="Слои карты" orientation="vertical" variant="outline">
      <GrButton>Схема</GrButton>
      <GrButton>Спутник</GrButton>
      <GrButton>Гибрид</GrButton>
    </GrButtonGroup>

    <!-- `attached: false` — тот же ряд, но без склейки: каждая кнопка со своими радиусами. -->
    <GrButtonGroup aria-label="Экспорт" :attached="false" variant="ghost">
      <GrButton>CSV</GrButton>
      <GrButton>XLSX</GrButton>
      <GrButton>PDF</GrButton>
    </GrButtonGroup>
  </div>
</template>
