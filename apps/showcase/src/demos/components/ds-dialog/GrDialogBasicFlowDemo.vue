<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open review dialog
    </GrButton>

    <GrDialog v-model="open" title="Publish weekly digest" size="sm">
      <div class="grid gap-4 text-sm text-[var(--muted-fg)]">
        <p>
          `GrDialog` собирает готовый header/footer shell поверх `GrModal`, поэтому его удобно использовать для простых approval flow.
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <GrBadge size="sm" tone="info">
            12 recipients
          </GrBadge>
          <GrBadge size="sm" tone="neutral">
            Draft ready
          </GrBadge>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            Cancel
          </GrButton>
          <GrButton @click="open = false">
            Publish
          </GrButton>
        </div>
      </template>
    </GrDialog>
  </div>
</template>