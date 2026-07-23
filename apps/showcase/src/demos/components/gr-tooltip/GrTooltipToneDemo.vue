<script setup lang="ts">
import { ref } from 'vue'

import { GrInput, GrTooltip } from '@feugene/granularity'

const tooltipText = ref('Escalation policy will be applied to new alerts only.')
const iconColor = ref('var(--gr-warning)')

// Пресеты цвета иконки из палитры GrTone: клик подставляет валидную CSS-переменную
// темы в инпут `icon-color` (раньше в демо был несуществующий `var(--warning)`).
const tonePresets: Array<{ tone: string, value: string }> = [
  { tone: 'primary', value: 'var(--gr-primary)' },
  { tone: 'neutral', value: 'var(--gr-muted-fg)' },
  { tone: 'success', value: 'var(--gr-success)' },
  { tone: 'warning', value: 'var(--gr-warning)' },
  { tone: 'danger', value: 'var(--gr-danger)' },
  { tone: 'info', value: 'var(--gr-info)' },
  { tone: 'slate', value: 'var(--gr-slate)' },
  { tone: 'azure', value: 'var(--gr-azure)' },
]
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-600 text-[var(--gr-fg)]">
        Custom tone
      </span>
      <GrTooltip :text="tooltipText" :icon-color="iconColor" />
      <code class="rounded bg-[var(--gr-muted)] px-2 py-1 text-xs text-[var(--gr-muted-fg)]">
        icon-color="{{ iconColor }}"
      </code>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="preset in tonePresets"
        :key="preset.tone"
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-[var(--gr-brd)] px-3 py-1 text-xs font-600 transition-colors hover:bg-[var(--gr-muted)]"
        :class="iconColor === preset.value ? 'ring-2 ring-[var(--gr-ring)]' : ''"
        @click="iconColor = preset.value"
      >
        <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: preset.value }" />
        {{ preset.tone }}
      </button>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <GrInput v-model="tooltipText" placeholder="Tooltip text" />
      <GrInput v-model="iconColor" placeholder="var(--gr-warning) / #f59e0b" />
    </div>
  </div>
</template>
