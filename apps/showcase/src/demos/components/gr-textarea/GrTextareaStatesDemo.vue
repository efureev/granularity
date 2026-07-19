<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrSwitch, GrTextarea } from '@feugene/granularity'

const draft = ref('Ship the new showcase after validating all public entities.')
const reviewNotes = ref('')
const invalid = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-3">
      <GrFormField label="Success state">
        <GrTextarea v-model="draft" state="success" />
      </GrFormField>

      <GrFormField label="Validation state" :error="invalid ? 'Review notes are required before publishing' : undefined">
        <GrTextarea
          v-model="reviewNotes"
          placeholder="Add review notes"
          :invalid="invalid"
          :state="invalid ? 'danger' : 'default'"
        />
      </GrFormField>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Validation toggle
      </div>
      <GrSwitch v-model="invalid" size="sm">
        Mark review notes as required
      </GrSwitch>
    </div>
  </div>
</template>