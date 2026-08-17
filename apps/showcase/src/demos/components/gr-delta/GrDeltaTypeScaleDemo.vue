<script setup lang="ts">
import { GrDelta } from '@feugene/granularity'
</script>

<template>
  <!--
    Разметка величины во всех трёх строках одна и та же — `size` не задан
    нигде. Кегль приходит от строки, поэтому стрелка и суффикс растут вместе
    с числом, а не остаются 14-пиксельными внутри заголовка.
  -->
  <div class="grid gap-4">
    <div class="text-[length:var(--gr-text-3xl)] leading-[var(--gr-leading-3xl)] font-600">
      Выручка за март
      <GrDelta :value="8.4" :precision="1" suffix="%" show-arrow />
    </div>

    <div class="text-[length:var(--gr-text-xl)] leading-[var(--gr-leading-xl)]">
      Средний чек
      <GrDelta :value="-3.2" :precision="1" suffix="%" show-arrow />
    </div>

    <div class="text-[length:var(--gr-control-text-sm)]">
      Возвраты
      <GrDelta :value="1.6" :precision="1" suffix="%" polarity="negative-good" show-arrow />
    </div>

    <!--
      Явная ступень нужна там, где величина стоит не в предложении, а в ряду
      с контролами: тогда она обязана совпасть с ними, а не с текстом вокруг.
    -->
    <div class="flex items-center gap-2 text-[length:var(--gr-text-xl)]">
      <span>В ряду с контролами:</span>
      <GrDelta :value="8.4" :precision="1" suffix="%" size="sm" />
    </div>
  </div>
</template>
