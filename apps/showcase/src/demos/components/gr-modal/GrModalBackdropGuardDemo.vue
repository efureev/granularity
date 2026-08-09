<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="text-sm text-[var(--gr-muted-fg)]">
      Try clicking the backdrop: the modal stays open until the user picks an explicit action.
    </div>

    <GrButton variant="outline" class="justify-self-start" @click="open = true">
      Open guarded modal
    </GrButton>

    <GrModal
      v-model="open"
      :close-on-backdrop="false"
      size="md"
      aria-label="Draft protection"
    >
      <div class="grid gap-4">
        <div class="grid gap-1">
          <div class="text-sm font-semibold text-[var(--gr-fg)]">
            Draft protection
          </div>
          <div class="text-sm text-[var(--gr-muted-fg)]">
            Use this mode for wizard/confirm flows where a draft must not be lost by accident.
          </div>
        </div>

        <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-muted)]/40 p-3 text-sm text-[var(--gr-muted-fg)]">
          Unsaved changes: pricing rules, SLA exceptions, recipients.
        </div>

        <div class="flex flex-wrap gap-3">
          <GrButton variant="outline" @click="open = false">
            Cancel
          </GrButton>
          <GrButton @click="open = false">
            Save draft
          </GrButton>
        </div>
      </div>
    </GrModal>
  </div>
</template>
