<script setup lang="ts">
import { ref } from 'vue'

import { GrCard, GrChip } from '@feugene/granularity'

// Метки задачи: состав ведёт приложение, чип только просит его убрать.
const tags = ref(['design', 'frontend', 'нужен ревью', 'v0.25'])

function drop(tag: string): void {
  tags.value = tags.value.filter(item => item !== tag)
}
</script>

<template>
  <GrCard class="p-4">
    <div class="flex flex-wrap items-center gap-2">
      <GrChip
        v-for="tag in tags"
        :key="tag"
        :label="tag"
        tone="slate"
        closable
        @remove="drop(tag)"
      />
      <span v-if="!tags.length" class="text-sm text-[var(--gr-muted-fg)]">
        Меток не осталось
      </span>
    </div>
  </GrCard>
</template>
