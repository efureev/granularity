<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrRadioGroupOrientation } from '@feugene/granularity'
import { GrRadioGroup, GrSegmented } from '@feugene/granularity'

const status = ref('review')
const orientation = ref<GrRadioGroupOrientation>('vertical')
const readonly = ref(false)

// Опция умеет быть отключённой и нести пояснение — без перехода на слот.
const options = [
  { value: 'draft', label: 'Draft', description: 'Виден только автору' },
  { value: 'review', label: 'In review', description: 'Ждёт решения редактора' },
  { value: 'published', label: 'Published', description: 'Опубликовано на сайте' },
  { value: 'archived', label: 'Archived', description: 'Доступно после снятия блокировки', disabled: true },
]

const selectedOption = computed(() => options.find(option => option.value === status.value)?.label ?? status.value)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-4">
      <div class="flex flex-wrap items-center gap-4">
        <GrSegmented
          v-model="orientation"
          size="sm"
          :options="[
            { value: 'vertical', label: 'vertical' },
            { value: 'horizontal', label: 'horizontal' },
          ]"
        />
        <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
          <input v-model="readonly" type="checkbox">
          readonly
        </label>
      </div>

      <GrRadioGroup
        v-model="status"
        :options="options"
        :orientation="orientation"
        :readonly="readonly"
      />
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      Selected state:
      <div class="mt-2 text-base font-semibold text-[var(--gr-fg)]">
        {{ selectedOption }}
      </div>
      <div class="mt-3">
        Отключённый вариант пропускается и стрелками, и `Tab`.
      </div>
    </div>
  </div>
</template>
