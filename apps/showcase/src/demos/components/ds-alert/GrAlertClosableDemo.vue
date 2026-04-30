<script setup lang="ts">
import { ref } from 'vue'

import { GrAlert, GrButton, GrCard } from '@feugene/granularity'

const visible = ref(true)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrAlert
      v-if="visible"
      title="Maintenance window"
      tone="warning"
      variant="light"
      closable
      @close="visible = false"
    >
      Payments will be processed in read-only mode from 02:00 to 02:30 UTC.
    </GrAlert>

    <GrCard v-else class="flex min-h-[92px] items-center justify-center p-4 text-sm text-[var(--muted-fg)]">
      Alert dismissed. Bring it back from the side panel.
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div>
        <div class="text-sm font-semibold text-[var(--fg)]">
          Close event
        </div>
        <div class="text-sm text-[var(--muted-fg)]">
          `close` is emitted so the host screen can hide or persist the banner state.
        </div>
      </div>

      <GrButton size="sm" variant="outline" :disabled="visible" @click="visible = true">
        Restore alert
      </GrButton>
    </GrCard>
  </div>
</template>
