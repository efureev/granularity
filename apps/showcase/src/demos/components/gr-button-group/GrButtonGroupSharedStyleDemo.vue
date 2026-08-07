<script setup lang="ts">
import { GrButton, GrButtonGroup, GrTooltip } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <!-- Оформление задаётся один раз на группе, а не повторяется на каждой кнопке. -->
    <GrButtonGroup aria-label="Период отчёта" size="sm" variant="outline" tone="neutral">
      <GrButton>День</GrButton>
      <GrButton>Неделя</GrButton>
      <GrButton tone="primary">
        Месяц
      </GrButton>
    </GrButtonGroup>

    <!-- Обёртка вокруг кнопки не разрывает ряд: склейка считает звенья, а не прямых потомков. -->
    <GrButtonGroup aria-label="Действия над документом" variant="outline">
      <GrButton>Открыть</GrButton>
      <GrTooltip content="Копия появится рядом с оригиналом">
        <GrButton>Дублировать</GrButton>
      </GrTooltip>
      <GrButton>Архивировать</GrButton>
    </GrButtonGroup>
  </div>
</template>
