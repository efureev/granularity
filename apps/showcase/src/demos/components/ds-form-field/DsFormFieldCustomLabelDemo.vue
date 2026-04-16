<script setup lang="ts">
import { ref } from 'vue'

import { DsCheckbox, DsFormField } from '@feugene/granularity'

const approvals = ref(false)
</script>

<template>
  <DsFormField
    label="Release checklist"
    label-class="font-semibold uppercase tracking-[0.12em] text-xs text-[var(--fg)]"
  >
    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <DsCheckbox v-model="approvals">
        I verified rollout steps and stakeholder approvals.
      </DsCheckbox>
      <div class="text-sm text-[var(--muted-fg)]">
        This pattern works well when the label behaves like a section heading instead of a per-input caption.
      </div>
    </div>
  </DsFormField>
</template>