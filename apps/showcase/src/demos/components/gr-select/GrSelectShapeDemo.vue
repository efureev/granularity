<script setup lang="ts">
import { ref } from 'vue'

import type { GrComponentSize, GrControlShape } from '@feugene/granularity'
import { GrSegmented, GrSelect } from '@feugene/granularity'

const shape = ref<GrControlShape>('pill')
const sizes: GrComponentSize[] = ['xs', 'sm', 'md', 'lg']

const statuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
  { value: 'published', label: 'Published' },
]

const values = ref<Record<string, string>>({ xs: 'draft', sm: 'review', md: 'published', lg: 'draft' })
const cleared = ref('review')
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="shape"
      :options="[{ value: 'box', label: 'box' }, { value: 'pill', label: 'pill' }]"
      size="sm"
      aria-label="Border shape"
    />

    <!--
      Шеврон стоит у правого края, и в пилюле он обязан остаться в стороне от
      дуги: отступ идёт за формой, поэтому проверять это стоит на всех ступенях.
    -->
    <div class="grid gap-3 sm:grid-cols-2">
      <GrSelect
        v-for="size in sizes"
        :key="size"
        v-model="values[size]"
        :options="statuses"
        :size="size"
        :shape="shape"
        :aria-label="`Status, size ${size}`"
      />
    </div>

    <!-- Кнопка очистки живёт в той же правой зоне, что и шеврон. -->
    <GrSelect
      v-model="cleared"
      :options="statuses"
      :shape="shape"
      clearable
      aria-label="Status with clear"
    />
  </div>
</template>
