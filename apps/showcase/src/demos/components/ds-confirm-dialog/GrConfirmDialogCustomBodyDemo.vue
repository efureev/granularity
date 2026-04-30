<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrConfirmDialog } from '@feugene/granularity'

const open = ref(false)
const archived = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center gap-3">
      <GrButton class="justify-self-start" @click="open = true">
        Archive sprint
      </GrButton>
      <GrBadge size="sm" :tone="archived ? 'success' : 'neutral'">
        {{ archived ? 'archived' : 'active' }}
      </GrBadge>
    </div>

    <GrConfirmDialog v-model="open" title="Archive sprint" confirm-text="Archive" @confirm="archived = true">
      <div class="grid gap-3 text-sm text-[var(--muted-fg)]">
        <p>Кастомный slot позволяет вывести richer summary прямо внутри confirm shell.</p>
        <ul class="list-disc pl-5">
          <li>18 tasks will move to history</li>
          <li>2 blocked items will stay pinned</li>
        </ul>
      </div>
    </GrConfirmDialog>
  </div>
</template>