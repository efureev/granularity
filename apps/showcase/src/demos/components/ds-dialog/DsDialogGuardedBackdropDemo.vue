<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <DsButton class="justify-self-start" @click="open = true">
      Open guarded dialog
    </DsButton>

    <DsDialog v-model="open" title="Resolve blockers" :close-on-backdrop="false" :show-close-button="false">
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
          <DsButton variant="outline" @click="open = false">
            Keep draft
          </DsButton>
          <DsButton @click="open = false">
            Continue review
          </DsButton>
        </div>
      </template>
    </DsDialog>
  </div>
</template>