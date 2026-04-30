import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormFieldExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-field-basic-label',
    title: 'Basic label and `forId` wiring',
    description: 'Минимальный сценарий показывает, как `GrFormField` связывает label и control, не навязывая конкретный input-тип.',
    status: 'ready',
    previewKey: 'ds-form-field-basic-label',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const name = ref('Operations dashboard')
</script>

<template>
  <GrFormField label="Workspace name" for-id="workspace-name">
    <GrInput id="workspace-name" v-model="name" placeholder="Enter workspace name" />
  </GrFormField>
</template>`,
  },
  {
    id: 'form-field-error-state',
    title: 'Inline validation message',
    description: 'Отдельно документируем ответственность `GrFormField` за error copy, когда сам control лишь сигнализирует invalid-state.',
    status: 'ready',
    previewKey: 'ds-form-field-error-state',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const slug = ref('')

const error = computed(() => {
  if (!slug.value)
    return 'Slug is required for deploy previews.'

  return /^[a-z0-9-]+$/.test(slug.value)
    ? undefined
    : 'Use lowercase latin letters, numbers and dashes only.'
})
</script>

<template>
  <GrFormField label="Preview slug" for-id="preview-slug" :error="error">
    <GrInput id="preview-slug" v-model="slug" :invalid="Boolean(error)" placeholder="team-dashboard" />
  </GrFormField>
</template>`,
  },
  {
    id: 'form-field-custom-label',
    title: 'Section-style labels via `labelClass`',
    description: 'Компонент можно использовать и как мини-секцию формы: label становится heading-строкой, а внутри slot живёт уже более сложная композиция.',
    status: 'ready',
    previewKey: 'ds-form-field-custom-label',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrCheckbox, GrFormField } from '@feugene/granularity'

const approvals = ref(false)
</script>

<template>
  <GrFormField
    label="Release checklist"
    label-class="font-semibold uppercase tracking-[0.12em] text-xs text-[var(--fg)]"
  >
    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <GrCheckbox v-model="approvals">
        I verified rollout steps and stakeholder approvals.
      </GrCheckbox>
      <div class="text-sm text-[var(--muted-fg)]">
        This pattern works well when the label behaves like a section heading instead of a per-input caption.
      </div>
    </div>
  </GrFormField>
</template>`,
  },
]
