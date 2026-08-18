<script setup lang="ts">
import { ref } from 'vue'

import { GrChip, GrChipGroup } from '@feugene/granularity'

// Метки можно и выбирать, и снимать: выбор ведёт группа, состав — приложение.
const labels = ref(['срочно', 'бэкенд', 'регресс', 'релиз 0.25'])
const active = ref<string[]>(['срочно'])

function drop(label: string): void {
  labels.value = labels.value.filter(item => item !== label)
  active.value = active.value.filter(item => item !== label)
}
</script>

<template>
  <div class="grid gap-3">
    <GrChipGroup v-model="active" closable aria-label="Метки записи" @remove="drop">
      <GrChip
        v-for="label in labels"
        :key="label"
        :value="label"
        :label="label"
        tone="warning"
      />
    </GrChipGroup>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Стрелки водят фокус по набору, Delete снимает метку под фокусом.
    </p>
  </div>
</template>
