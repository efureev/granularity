<script setup lang="ts">
import { ref } from 'vue'

import { GrAlert, GrButton } from '@feugene/granularity'

const visible = ref(true)
const attempts = ref(0)
</script>

<template>
  <div class="grid gap-4">
    <GrAlert
      v-model:visible="visible"
      tone="danger"
      title="Export failed"
      closable
    >
      The report service returned 502 while building «Q3 revenue».

      <template #actions>
        <GrButton size="sm" tone="danger" @click="attempts++">
          Retry
        </GrButton>
        <GrButton size="sm" variant="outline" tone="danger">
          Open logs
        </GrButton>
      </template>
    </GrAlert>

    <div v-if="!visible" class="flex items-center gap-3">
      <span class="text-sm text-[var(--gr-muted-fg)]">Alert dismissed itself.</span>
      <GrButton size="sm" variant="outline" @click="visible = true">
        Bring it back
      </GrButton>
    </div>

    <GrAlert tone="slate" :icon="false">
      Retried {{ attempts }} time(s). Without an icon the message reads as a plain note —
      useful in dense forms where every alert would otherwise shout.
    </GrAlert>
  </div>
</template>
