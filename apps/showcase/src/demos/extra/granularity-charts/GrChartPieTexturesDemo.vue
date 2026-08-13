<script setup lang="ts">
/**
 * Семь долей на пяти ролях палитры.
 *
 * Шестая доля повторяет цвет первой, седьмая — второй, и на круге соседние доли
 * стоят вплотную: повтор читается как «это одно и то же». Поэтому со второго
 * круга палитры к цвету добавляется штриховка — тот же принцип, по которому
 * линейный график меняет форму точки.
 */
const languages = [
  { label: 'TypeScript', value: 38 },
  { label: 'Vue SFC', value: 24 },
  { label: 'CSS', value: 12 },
  { label: 'Markdown', value: 9 },
  { label: 'JSON', value: 7 },
  { label: 'Shell', value: 6 },
  { label: 'YAML', value: 4 },
]
</script>

<template>
  <div class="grid gap-3">
    <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Состав репозитория, % строк
    </span>

    <GrChartPie
      :data="languages"
      variant="donut"
      :height="260"
      total-label="% всего"
      aria-label="Состав репозитория по языкам"
    />
  </div>
</template>
