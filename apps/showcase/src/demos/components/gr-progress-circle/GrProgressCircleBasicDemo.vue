<script setup lang="ts">
import { GrProgressCircle } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
const tones = [
  { tone: 'primary', value: 72 },
  { tone: 'success', value: 100 },
  { tone: 'warning', value: 48 },
  { tone: 'danger', value: 19 },
] as const
</script>

<template>
  <div class="grid gap-6">
    <div class="flex flex-wrap items-end gap-6">
      <div v-for="size in sizes" :key="size" class="grid justify-items-center gap-2">
        <GrProgressCircle :value="64" :size="size" :show-value="size !== 'xs'" aria-label="Заполнение диска" />
        <code class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">{{ size }}</code>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-6">
      <GrProgressCircle
        v-for="item in tones"
        :key="item.tone"
        :value="item.value"
        :tone="item.tone"
        show-value
        status-icon
        :aria-label="`Тон ${item.tone}`"
      />
    </div>
  </div>
</template>
