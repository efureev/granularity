<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrInput, GrSegmented, GrSwitch } from '@feugene/granularity'

const size = ref<'sm' | 'md'>('md')
const compact = ref(true)

const host = ref('')
const port = ref('5432')

// Несколько претензий к одному полю: массив вместо склеенной строки.
const hostErrors = computed<string[]>(() => {
  const issues: string[] = []
  if (!host.value)
    issues.push('Хост обязателен')
  else if (host.value.includes(' '))
    issues.push('Пробелы в хосте недопустимы')
  if (host.value.endsWith('.'))
    issues.push('Точка в конце — опечатка')
  return issues
})

const portError = computed(() => (Number(port.value) > 0 ? undefined : 'Порт — положительное число'))
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <GrSegmented
        v-model="size"
        size="sm"
        :options="[{ value: 'sm', label: 'size=sm' }, { value: 'md', label: 'size=md' }]"
      />
      <GrSwitch v-model="compact" size="sm">
        Подпись сбоку
      </GrSwitch>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <GrFormField
        label="Хост"
        hint="Домен или IP базы"
        :error="hostErrors"
        :size="size"
        :label-position="compact ? 'start' : 'top'"
        :label-width="140"
        required
      >
        <GrInput v-model="host" :size="size" placeholder="db.internal" />
      </GrFormField>

      <!-- `showMessage: false` — поле остаётся невалидным для контрола и AT,
           но текст не занимает места: объяснение живёт в сводке формы. -->
      <GrFormField
        label="Порт"
        :error="portError"
        :show-message="false"
        :size="size"
        :label-position="compact ? 'start' : 'top'"
        :label-width="140"
      >
        <GrInput v-model="port" :size="size" />
      </GrFormField>
    </div>
  </div>
</template>
