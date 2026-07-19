<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPromptDialog } from '@feugene/granularity'

const open = ref(false)
const note = ref('Call finance before noon')
const lastSubmitted = ref(note.value)
</script>

<template>
  <div class="grid gap-3">
    <GrButton variant="outline" class="justify-self-start" @click="open = true">
      Open optional prompt
    </GrButton>

    <div class="text-xs text-[var(--muted-fg)]">
      Last submitted note: <span class="font-medium text-[var(--fg)]">{{ lastSubmitted || '—' }}</span>
    </div>

    <GrPromptDialog
      v-model="open"
      v-model:value="note"
      title="Leave handoff note"
      label="Optional note"
      placeholder="Add context for the next shift"
      confirm-text="Attach"
      :required="false"
      button-size="sm"
      @confirm="lastSubmitted = $event"
    />
  </div>
</template>