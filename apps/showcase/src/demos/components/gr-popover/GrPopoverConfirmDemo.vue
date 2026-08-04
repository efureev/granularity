<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPopover } from '@feugene/granularity'

const open = ref(false)
const archived = ref(false)

function confirm(): void {
  archived.value = true
  open.value = false
}
</script>

<template>
  <div class="flex items-center gap-3">
    <GrPopover
      v-model:open="open"
      aria-label="Confirm archiving"
      placement="top"
      size="sm"
    >
      <template #trigger="{ triggerProps }">
        <GrButton variant="outline" tone="danger" v-bind="triggerProps">
          Archive invoice
        </GrButton>
      </template>

      <template #content>
        <div class="grid w-56 gap-3">
          <p class="text-[var(--gr-fg)]">
            Archive this invoice? You can restore it from the archive later.
          </p>

          <div class="flex justify-end gap-2">
            <GrButton variant="ghost" size="xs" @click="open = false">
              Cancel
            </GrButton>
            <GrButton size="xs" tone="danger" @click="confirm">
              Archive
            </GrButton>
          </div>
        </div>
      </template>
    </GrPopover>

    <span v-if="archived" class="text-sm text-[var(--gr-muted-fg)]">
      Invoice archived
    </span>
  </div>
</template>
