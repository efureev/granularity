<script setup lang="ts">
import { ref } from 'vue'

import type { GrControlShape, GrSegmentedOption } from '@feugene/granularity'
import { GrSegmented, GrSelect } from '@feugene/granularity'

const view = ref<'grid' | 'list'>('grid')
const owner = ref('me')

// Форма — ось, соседняя размеру: у сегментов дефолт `pill`, у полей `box`.
// Переключатель показывает, зачем это нужно: рядом с селектом пилюля читается
// гостем из другой системы.
const shape = ref<GrControlShape>('pill')

const views: GrSegmentedOption[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
]

const owners = [
  { value: 'me', label: 'Assigned to me' },
  { value: 'team', label: 'Whole team' },
]
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="shape"
      :options="[{ value: 'pill', label: 'pill' }, { value: 'box', label: 'box' }]"
      size="sm"
      aria-label="Border shape"
    />

    <div class="grid gap-3 rounded-[24px] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5 sm:grid-cols-2">
      <GrSegmented
        v-model="view"
        :options="views"
        :shape="shape"
        block
        aria-label="Layout"
      />
      <GrSelect v-model="owner" :options="owners" :shape="shape" aria-label="Owner filter" />
    </div>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Shape is independent of size: <code>shape="{{ shape }}"</code> reads the same at every step of the scale.
    </p>
  </div>
</template>
