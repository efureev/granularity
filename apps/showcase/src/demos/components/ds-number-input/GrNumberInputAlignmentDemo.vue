<script setup lang="ts">
import { ref } from 'vue'

import { GrNumberInput, GrRadioGroup } from '@feugene/granularity'

const alignment = ref<'left' | 'center' | 'right'>('right')
const alignmentOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
]
const budget = ref('240000')
</script>

<template>
  <div class="grid gap-4">
    <GrRadioGroup
      v-model="alignment"
      :options="alignmentOptions"
      variant="button"
      size="sm"
    />

    <div class="grid gap-3 lg:grid-cols-2">
      <GrNumberInput
        v-model="budget"
        :text-align="alignment"
        suffix-min-width="3rem"
        suffix-max-width="8rem"
        placeholder="0"
      >
        <template #prefix>Budget</template>
        <template #suffix>Monthly recurring revenue</template>
      </GrNumberInput>

      <div class="rounded-2xl border border-dashed border-[var(--brd)] bg-[var(--muted)]/40 p-4 text-sm text-[var(--muted-fg)]">
        `textAlign` помогает согласовать числовые поля с табличными layout и формами с денежными значениями.
      </div>
    </div>
  </div>
</template>