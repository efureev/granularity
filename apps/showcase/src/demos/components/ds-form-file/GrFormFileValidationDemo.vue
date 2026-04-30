<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrFormField, GrFormFile } from '@feugene/granularity'
import type { FileValidationIssue } from '@feugene/granularity'

const selectedFile = ref<File | null>(null)
const validationMessages = ref<string[]>([])

function validateFiles(files: File[]): FileValidationIssue[] {
  return files.flatMap((file) => {
    const issues: FileValidationIssue[] = []

    if (file.size > 1024 * 1024)
      issues.push({ code: 'custom:max-size', message: 'Keep review attachments under 1 MB for faster handoff.' })

    if (!file.name.endsWith('.pdf'))
      issues.push({ code: 'custom:pdf-only', message: 'QA requests PDF exports for approval packets.' })

    return issues
  })
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrBadge tone="info" radius="round">Only `.pdf`</GrBadge>
      <GrBadge tone="warning" radius="round">Up to 1 MB</GrBadge>
    </div>

    <GrFormField
      label="Approval packet"
      for-id="showcase-form-file-validation"
      :error="validationMessages[0]"
    >
      <GrFormFile
        v-model="selectedFile"
        accept=".pdf"
        :validate="validateFiles"
        placeholder="Upload approval packet"
        upload-text="Upload packet"
        change-text="Replace packet"
        @update:errors="validationMessages = $event.map(issue => issue.message ?? issue.code)"
      />
    </GrFormField>

    <div class="text-sm text-[var(--muted-fg)]">
      Latest validation status:
      <span class="font-semibold text-[var(--fg)]">
        {{ validationMessages[0] ?? 'Ready for upload review' }}
      </span>
    </div>
  </div>
</template>