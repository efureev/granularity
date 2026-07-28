<script setup lang="ts">
import { ref } from 'vue'

import { GrCheckbox, GrFormField, GrInput } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const size = ref<typeof sizes[number]>('md')
const compact = ref(true)
const digest = ref(false)
const project = ref('Granularity')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <GrCheckbox
        v-for="value in sizes"
        :key="value"
        :model-value="size === value"
        :size="value"
        @update:model-value="size = value"
      >
        {{ value }}
      </GrCheckbox>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <!-- Подпись через GrFormField: он выдаёт контролу id и связывает с ним
           `<label for>`. Нарисованный рядом текст доступным именем не становится. -->
      <GrFormField label="Project name">
        <GrInput v-model="project" :size="size" />
      </GrFormField>

      <GrCheckbox v-model="compact" :size="size">
        Compact rows
      </GrCheckbox>
      <GrCheckbox v-model="digest" :size="size" indeterminate>
        Partial digest selection
      </GrCheckbox>
    </div>
  </div>
</template>
