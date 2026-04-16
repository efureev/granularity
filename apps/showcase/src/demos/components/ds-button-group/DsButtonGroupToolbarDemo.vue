<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsButtonGroup, DsCard } from '@feugene/granularity'

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
  <DsCard class="grid gap-4 p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <DsButtonGroup aria-label="Formatting toolbar">
        <DsButton
          v-for="tool in tools"
          :key="tool.value"
          size="sm"
          :variant="activeTools.includes(tool.value) ? 'primary' : 'outline'"
          @click="toggleTool(tool.value)"
        >
          {{ tool.label }}
        </DsButton>
      </DsButtonGroup>

      <div class="flex flex-wrap gap-2">
        <DsBadge
          v-for="tool in activeTools"
          :key="tool"
          size="sm"
          variant="secondary"
        >
          {{ tool }}
        </DsBadge>
      </div>
    </div>

    <p class="text-sm text-[var(--fg)]">
      Release note title
    </p>
    <p class="text-sm text-[var(--muted-fg)]">
      Button groups удобно использовать в компактных toolbars, где важна предсказуемая ширина и визуальная связность соседних действий.
    </p>
  </DsCard>
</template>