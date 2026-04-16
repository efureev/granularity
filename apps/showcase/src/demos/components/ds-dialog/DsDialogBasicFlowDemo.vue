<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <DsButton class="justify-self-start" @click="open = true">
      Open review dialog
    </DsButton>

    <DsDialog v-model="open" title="Publish weekly digest" size="sm">
      <div class="grid gap-4 text-sm text-[var(--muted-fg)]">
        <p>
          `DsDialog` собирает готовый header/footer shell поверх `DsModal`, поэтому его удобно использовать для простых approval flow.
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <DsBadge size="sm" tone="info">
            12 recipients
          </DsBadge>
          <DsBadge size="sm" tone="neutral">
            Draft ready
          </DsBadge>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <DsButton variant="outline" @click="open = false">
            Cancel
          </DsButton>
          <DsButton @click="open = false">
            Publish
          </DsButton>
        </div>
      </template>
    </DsDialog>
  </div>
</template>