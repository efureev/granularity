<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrRadioGroup, GrSelect } from '@feugene/granularity'

const view = ref('board')
const size = ref<'sm' | 'md' | 'lg'>('md')

const sizeOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const viewOptions = [
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'table', label: 'Table' },
]
</script>

<template>
  <div class="grid gap-4">
    <!-- GrFormField, а не отдельный div с текстом: он выдаёт селекту id и связывает
         с ним `<label for>`. Нарисованная рядом подпись доступным именем не становится. -->
    <div class="md:max-w-[220px]">
      <GrFormField label="Button size">
        <GrSelect v-model="size" :options="sizeOptions" />
      </GrFormField>
    </div>

    <GrRadioGroup v-model="view" :options="viewOptions" variant="button" :size="size" />
  </div>
</template>