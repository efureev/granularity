<script setup lang="ts">
import { ref } from 'vue'

const mode = ref<'view' | 'edit'>('view')
const period = ref('week')
const lastReset = ref('—')

const PERIODS = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]

function onReset(): void {
  lastReset.value = `режим «${mode.value === 'edit' ? 'правка' : 'просмотр'}»`
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <GrDashboardToolbar v-model:mode="mode" resettable @reset="onReset">
      <template #start>
        <div class="flex items-center gap-3">
          <span class="font-600 whitespace-nowrap">Продажи</span>
          <GrSelect v-model="period" :options="PERIODS" size="sm" class="w-32" aria-label="Период" />
        </div>
      </template>

      <template #end>
        <GrButton variant="ghost" size="sm">
          Экспорт
        </GrButton>
      </template>
    </GrDashboardToolbar>

    <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      Режим: <b>{{ mode === 'edit' ? 'правка' : 'просмотр' }}</b> · период: <b>{{ period }}</b> · сброс: <b>{{ lastReset }}</b>
    </p>

    <GrDashboardToolbar :mode="mode" disabled />
  </div>
</template>
