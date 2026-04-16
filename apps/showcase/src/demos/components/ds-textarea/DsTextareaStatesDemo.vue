<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsSwitch, DsTextarea } from '@feugene/granularity'

const draft = ref('Ship the new showcase after validating all public entities.')
const reviewNotes = ref('')
const invalid = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-3">
      <DsFormField label="Success state">
        <DsTextarea v-model="draft" state="success" />
      </DsFormField>

      <DsFormField label="Validation state" :error="invalid ? 'Review notes are required before publishing' : undefined">
        <DsTextarea
          v-model="reviewNotes"
          placeholder="Add review notes"
          :invalid="invalid"
          :state="invalid ? 'danger' : 'default'"
        />
      </DsFormField>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Validation toggle
      </div>
      <DsSwitch v-model="invalid" size="sm">
        Mark review notes as required
      </DsSwitch>
    </div>
  </div>
</template>