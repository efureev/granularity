import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormFileExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-file-basic-selection',
    title: 'Single file selection with summary state',
    description: 'Базовый сценарий показывает single-file поток: поле управляет выбором/заменой файла, а экран отдельно отображает business-friendly summary.',
    status: 'ready',
    previewKey: 'ds-form-file-basic-selection',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrFormFile } from '@feugene/granularity'

const selectedFile = ref<File | null>(null)

const summary = computed(() => {
  if (!(selectedFile.value instanceof File))
    return 'Select a PDF or spreadsheet to populate the contract field.'

  return selectedFile.value.name + ' • ' + (selectedFile.value.size / 1024).toFixed(1) + ' KB'
})
</script>

<template>
  <div class="grid gap-4">
    <GrFormField label="Signed contract" for-id="showcase-form-file-basic">
      <GrFormFile
        v-model="selectedFile"
        accept=".pdf,.xlsx,.csv"
        placeholder="No contract attached yet"
        upload-text="Attach file"
        change-text="Replace file"
        remove-text="Remove attachment"
      />
    </GrFormField>

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      {{ summary }}
    </div>
  </div>
</template>`,
  },
  {
    id: 'form-file-custom-validation',
    title: 'Custom validation with surfaced errors',
    description: 'Отдельно фиксируем `validate`/`update:errors`: showcase должен показать, что `GrFormFile` подходит и для domain-specific upload rules, а не только для `accept`.',
    status: 'ready',
    previewKey: 'ds-form-file-custom-validation',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrFormField, GrFormFile } from '@feugene/granularity'

const selectedFile = ref<File | null>(null)
const validationMessages = ref<string[]>([])

function validateFiles(files: File[]) {
  return files.flatMap((file) => {
    const issues: { code: string, message: string }[] = []

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
      <GrBadge tone="info" radius="round">Only .pdf</GrBadge>
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
        placeholder="Upload approval packet"
        upload-text="Upload packet"
        change-text="Replace packet"
        @update:errors="validationMessages = $event.map(issue => issue.message ?? issue.code)"
        :validate="validateFiles"
      />
    </GrFormField>

    <div class="text-sm text-[var(--muted-fg)]">
      Latest validation status:
      <span class="font-semibold text-[var(--fg)]">
        {{ validationMessages[0] ?? 'Ready for upload review' }}
      </span>
    </div>
  </div>
</template>`,
  },
  {
    id: 'form-file-multiple-queue',
    title: 'Multiple attachment queue',
    description: 'Многофайловый режим раскрывает список выбранных файлов и подходит для attachment-очередей в support/review-формах.',
    status: 'ready',
    previewKey: 'ds-form-file-multiple-queue',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrFormFile } from '@feugene/granularity'

const attachments = ref<File[]>([])

const totalSizeLabel = computed(() => {
  const totalBytes = attachments.value.reduce((sum, file) => sum + file.size, 0)
  return (totalBytes / 1024).toFixed(1) + ' KB'
})
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <GrBadge tone="neutral" radius="round">{{ attachments.length }} files</GrBadge>
      <GrBadge tone="secondary" radius="round">{{ totalSizeLabel }}</GrBadge>
    </div>

    <GrFormFile
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
</template>`,
  },
]
