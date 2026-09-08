<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrKbd, vHotkey } from '@feugene/granularity'

const vHotkeyDirective = vHotkey

const visited = ref<string[]>([])

function note(place: string) {
  visited.value = [place, ...visited.value].slice(0, 4)
}

// Одна и та же строка описывает и привязку, и подсказку — разойтись им нечем.
const chains = [
  { keys: 'g i', label: 'К задачам' },
  { keys: 'g p', label: 'К проектам' },
  { keys: 'mod+k p', label: 'Палитра, затем проект' },
]

const handlers = {
  'g i': () => note('К задачам'),
  'g p': () => note('К проектам'),
  'mod+k p': () => note('Палитра, затем проект'),
}
</script>

<template>
  <div
    v-hotkey-directive="{ handlers, scope: 'element' }"
    tabindex="0"
    class="grid gap-3 rounded-xl border border-[var(--gr-brd)] p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
  >
    <div class="text-sm text-[var(--gr-fg)]">
      Кликните сюда и наберите сочетание — шаги нажимаются один за другим.
    </div>

    <div class="grid gap-2">
      <div v-for="chain in chains" :key="chain.keys" class="flex items-center gap-3 text-sm">
        <GrKbd :keys="chain.keys" />
        <span class="text-[var(--gr-muted-fg)]">{{ chain.label }}</span>
      </div>
    </div>

    <div data-fired class="flex flex-wrap items-center gap-2">
      <span class="text-xs text-[var(--gr-muted-fg)]">Сработало:</span>
      <GrBadge v-for="(place, index) in visited" :key="`${place}-${index}`" tone="neutral">
        {{ place }}
      </GrBadge>
      <span v-if="visited.length === 0" class="text-xs text-[var(--gr-muted-fg)]">пока ничего</span>
    </div>
  </div>
</template>
