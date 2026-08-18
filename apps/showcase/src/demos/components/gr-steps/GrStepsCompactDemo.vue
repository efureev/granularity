<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCard, GrSteps } from '@feugene/granularity'
import type { GrStep } from '@feugene/granularity'

// Семь этапов не помещаются в боковую колонку: там лента вырождается в подпись
// с полосой, а не в скроллер, из которого половина шагов не видна.
const steps: GrStep[] = [
  { value: 'a', label: 'Организация' },
  { value: 'b', label: 'Реквизиты' },
  { value: 'c', label: 'Сотрудники' },
  { value: 'd', label: 'Роли' },
  { value: 'e', label: 'Интеграции' },
  { value: 'f', label: 'Уведомления' },
  { value: 'g', label: 'Проверка' },
]

const current = ref('c')
const stepsRef = ref<InstanceType<typeof GrSteps> | null>(null)
</script>

<template>
  <GrCard class="grid max-w-xs gap-4 p-4">
    <GrSteps ref="stepsRef" v-model="current" :steps="steps" variant="compact" />

    <div class="flex gap-2">
      <GrButton size="sm" variant="outline" @click="stepsRef?.back()">
        Назад
      </GrButton>
      <GrButton size="sm" @click="stepsRef?.next()">
        Далее
      </GrButton>
    </div>
  </GrCard>
</template>
