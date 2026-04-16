<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsBadge, DsFormFile } from '@feugene/granularity'

const attachments = ref<File[]>([])

const totalSizeLabel = computed(() => {
  const totalBytes = attachments.value.reduce((sum, file) => sum + file.size, 0)
  return `${(totalBytes / 1024).toFixed(1)} KB`
})
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <DsBadge tone="info" radius="semi">{{ attachments.length }} files</DsBadge>
      <DsBadge tone="info" radius="semi">{{ totalSizeLabel }}</DsBadge>
    </div>

    <DsFormFile
      v-model="attachments"
      multiple
      accept=".png,.jpg,.pdf"
      placeholder="Drop screenshots or PDF notes"
      upload-text="Add assets"
      change-text="Add more"
      clear-all-text="Clear queue"
    />

    <div class="rounded-2xl border border-dashed border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      This scenario mirrors incident-report attachments where reviewers build a small queue before submitting the form.
    </div>
  </div>
</template>