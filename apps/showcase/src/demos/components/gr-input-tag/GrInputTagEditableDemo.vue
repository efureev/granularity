<script setup lang="ts">
import { ref } from 'vue'

import { GrInputTag } from '@feugene/granularity'

const tags = ref(['design-system-tokens-v2', 'accessibility-audit', 'release-notes'])
</script>

<template>
  <div class="grid gap-4">
    <GrInputTag
      v-model="tags"
      editable
      placeholder="Метка задачи"
      aria-label="Метки задачи"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Двойной клик по тегу открывает правку; с клавиатуры — <code>F2</code> на крестике.
      <code>Enter</code> сохраняет, <code>Escape</code> отменяет, уход фокуса сохраняет.
      Пустое значение по <code>Enter</code> снимает тег.
    </p>
  </div>
</template>
