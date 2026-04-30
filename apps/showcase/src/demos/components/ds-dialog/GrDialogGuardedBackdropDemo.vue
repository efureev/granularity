<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open guarded dialog
    </GrButton>

    <GrDialog v-model="open" title="Resolve blockers" :close-on-backdrop="false" :show-close-button="false">
      <div class="grid gap-3 text-sm text-[var(--muted-fg)]">
        <p>
          В критичных flows можно отключить backdrop close и оставить только явные действия в footer.
        </p>
        <ul class="list-disc pl-5">
          <li>2 approvals are still pending</li>
          <li>1 issue is waiting for legal review</li>
        </ul>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            Keep draft
          </GrButton>
          <GrButton @click="open = false">
            Continue review
          </GrButton>
        </div>
      </template>
    </GrDialog>
  </div>
</template>