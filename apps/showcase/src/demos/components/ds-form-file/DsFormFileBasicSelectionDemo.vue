<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsFormField, DsFormFile } from '@feugene/granularity'

const selectedFile = ref<File | null>(null)

const summary = computed(() => {
  if (!(selectedFile.value instanceof File))
    return 'Select a PDF or spreadsheet to populate the contract field.'

  return `${selectedFile.value.name} • ${(selectedFile.value.size / 1024).toFixed(1)} KB`
})
</script>

<template>
  <div class="grid gap-4">
    <DsFormField label="Signed contract" for-id="showcase-form-file-basic">
      <DsFormFile
        v-model="selectedFile"
        accept=".pdf,.xlsx,.csv"
        placeholder="No contract attached yet"
        upload-text="Attach file"
        change-text="Replace file"
        remove-text="Remove attachment"
      />
    </DsFormField>

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      {{ summary }}
    </div>
  </div>
</template>