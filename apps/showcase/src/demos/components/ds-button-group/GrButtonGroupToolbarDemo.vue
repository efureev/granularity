<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrButtonGroup, GrCard } from '@feugene/granularity'

const activeTools = ref(['bold', 'underline'])

const tools = [
  { label: 'B', value: 'bold' },
  { label: 'I', value: 'italic' },
  { label: 'U', value: 'underline' },
]

function toggleTool(tool: string) {
  if (activeTools.value.includes(tool)) {
    activeTools.value = activeTools.value.filter(value => value !== tool)
    return
  }

  activeTools.value = [...activeTools.value, tool]
}
</script>

<template>
  <GrCard class="grid gap-4 p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <GrButtonGroup aria-label="Formatting toolbar">
        <GrButton
          v-for="tool in tools"
          :key="tool.value"
          size="sm"
          :variant="activeTools.includes(tool.value) ? 'primary' : 'outline'"
          @click="toggleTool(tool.value)"
        >
          {{ tool.label }}
        </GrButton>
      </GrButtonGroup>

      <div class="flex flex-wrap gap-2">
        <GrBadge
          v-for="tool in activeTools"
          :key="tool"
          size="sm"
          variant="secondary"
        >
          {{ tool }}
        </GrBadge>
      </div>
    </div>

    <p class="text-sm text-[var(--fg)]">
      Release note title
    </p>
    <p class="text-sm text-[var(--muted-fg)]">
      Button groups удобно использовать в компактных toolbars, где важна предсказуемая ширина и визуальная связность соседних действий.
    </p>
  </GrCard>
</template>