import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormFileExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-file-basic-selection',
    title: 'Single file selection with summary state',
    description: 'Базовый сценарий показывает single-file поток: поле управляет выбором/заменой файла, а экран отдельно отображает business-friendly summary.',
    status: 'ready',
    previewKey: 'gr-form-file-basic-selection',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrFormFile } from '@feugene/granularity'

const selectedFile = ref<File | null>(null)

const summary = computed(() => {
  if (!(selectedFile.value instanceof File))
    return 'Select a PDF or spreadsheet to populate the contract field.'

  return \`\${selectedFile.value.name} • \${(selectedFile.value.size / 1024).toFixed(1)} KB\`
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

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
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
    previewKey: 'gr-form-file-custom-validation',
    code: `<script setup lang="ts">
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
      <GrBadge tone="info" radius="round">Only \`.pdf\`</GrBadge>
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

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Latest validation status:
      <span class="font-semibold text-[var(--gr-fg)]">
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
    previewKey: 'gr-form-file-multiple-queue',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrFormFile } from '@feugene/granularity'

const attachments = ref<File[]>([])

const totalSizeLabel = computed(() => {
  const totalBytes = attachments.value.reduce((sum, file) => sum + file.size, 0)
  return \`\${(totalBytes / 1024).toFixed(1)} KB\`
})
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <GrBadge tone="info" radius="semi">{{ attachments.length }} files</GrBadge>
      <GrBadge tone="info" radius="semi">{{ totalSizeLabel }}</GrBadge>
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

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      This scenario mirrors incident-report attachments where reviewers build a small queue before submitting the form.
    </div>
  </div>
</template>`,
  },
  {
    id: 'form-file-sizes',
    title: 'Шкала размеров',
    description: 'Размер доезжает до вложенных кнопок и иконок, поэтому поле выбора файла встаёт в один ряд с остальными контролами формы.',
    status: 'ready',
    previewKey: 'gr-form-file-sizes',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrFormFile } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const file = ref<File | File[] | null>(null)
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrFormField label="Attachment">
        <GrFormFile v-model="file" :size="size" accept=".pdf,.png" />
      </GrFormField>
    </div>
  </div>
</template>`,
  },
  {
    id: 'form-file-server-errors',
    title: 'Server errors and limit',
    description: '`v-model:errors` — двусторонний канал: в него пишет и внутренняя валидация, и ответ сервера. `limit` отбивает лишние файлы тем же правилом, что и остальные.',
    status: 'ready',
    previewKey: 'gr-form-file-server-errors',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import type { GrFormFileError } from '@feugene/granularity'
import { GrButton, GrFormFile, GrFormField } from '@feugene/granularity'

const files = ref<File[]>([])
// \`v-model:errors\` — двусторонний канал: сюда пишет и внутренняя валидация,
// и ответ сервера.
const errors = ref<GrFormFileError[]>([])
const sending = ref(false)

async function submit(): Promise<void> {
  if (!files.value.length) return

  sending.value = true
  await new Promise(resolve => setTimeout(resolve, 700))
  sending.value = false

  errors.value = [{
    code: 'accept',
    fileName: files.value[0]?.name,
    message: 'Сервис принимает только подписанные PDF',
  }]
}
</script>

<template>
  <div class="grid gap-3">
    <GrFormField label="Документы" hint="До трёх файлов, только PDF">
      <GrFormFile
        v-model="files"
        v-model:errors="errors"
        accept="application/pdf,.pdf"
        multiple
        :limit="3"
      />
    </GrFormField>

    <div class="flex flex-wrap items-center gap-3">
      <GrButton size="sm" :loading="sending" :disabled="!files.length" @click="submit">
        Отправить
      </GrButton>
      <GrButton size="sm" variant="ghost" :disabled="!errors.length" @click="errors = []">
        Сбросить ошибки
      </GrButton>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Ошибки объявляются \`role="alert"\` и связаны с кнопкой выбора через \`aria-describedby\` —
      и те, что нашла валидация, и те, что вернул сервер.
    </div>
  </div>
</template>`,
  },
]
