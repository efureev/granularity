<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCommandPalette, type GrCommandItem } from '@feugene/granularity'

const open = ref(false)
const lastCommand = ref<string | null>(null)

// Сорок групп по сто двадцать пять команд. Группы переживают окно: если список
// прокручен внутрь группы, её обёртка всё равно есть и берёт имя через
// `aria-label` — заголовка в разметке в этот момент нет.
const commands: GrCommandItem[] = Array.from({ length: 40 }, (_, groupIndex) =>
  Array.from({ length: 125 }, (_, index) => ({
    id: `g${groupIndex + 1}-cmd-${index + 1}`,
    label: `Group ${groupIndex + 1} · Command ${index + 1}`,
    group: `Group ${groupIndex + 1}`,
  }))).flat()

function onSelect(item: GrCommandItem): void {
  lastCommand.value = item.label
}
</script>

<template>
  <div class="grid gap-4">
    <GrButton class="justify-self-start" @click="open = true">
      Open palette with 5 000 commands
    </GrButton>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Last command: <code>{{ lastCommand ?? '—' }}</code>
    </p>

    <GrCommandPalette
      v-model="open"
      :items="commands"
      virtual
      :max-height="360"
      @select="onSelect"
    />
  </div>
</template>
