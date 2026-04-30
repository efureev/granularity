<script setup lang="ts">
import { ref } from 'vue'

import { GrInput, GrRadioGroup } from '@feugene/granularity'

const alignment = ref<'left' | 'center' | 'right'>('left')
const alignmentOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
]

const sizeValues = {
  xs: ref('xs size'),
  sm: ref('sm size'),
  md: ref('md size'),
  lg: ref('lg size'),
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-2 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="showcase-demo-title text-sm font-semibold">
        Text alignment
      </div>
      <GrRadioGroup
        v-model="alignment"
        :options="alignmentOptions"
        variant="button"
        size="sm"
      />
      <GrInput
        :model-value="`Aligned to ${alignment}`"
        :text-align="alignment"
        placeholder="Editable content"
      />
    </div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div class="grid gap-2">
        <div class="showcase-demo-caption text-xs">xs</div>
        <GrInput v-model="sizeValues.xs.value" size="xs" placeholder="Extra small" />
      </div>
      <div class="grid gap-2">
        <div class="showcase-demo-caption text-xs">sm</div>
        <GrInput v-model="sizeValues.sm.value" size="sm" placeholder="Small" />
      </div>
      <div class="grid gap-2">
        <div class="showcase-demo-caption text-xs">md</div>
        <GrInput v-model="sizeValues.md.value" size="md" placeholder="Medium" />
      </div>
      <div class="grid gap-2">
        <div class="showcase-demo-caption text-xs">lg</div>
        <GrInput v-model="sizeValues.lg.value" size="lg" placeholder="Large" />
      </div>
    </div>
  </div>
</template>