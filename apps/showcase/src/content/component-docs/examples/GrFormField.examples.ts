import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormFieldExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-field-context',
    title: 'Auto id, hint, required and error linking',
    description: 'Поле само генерирует `id` (связка с `label for`) и через provide/inject отдаёт контролу `aria-describedby` (hint + error), `aria-invalid` и `aria-required` — без ручного `forId`. Ошибка анонсируется через `role="alert"`.',
    status: 'ready',
    previewKey: 'gr-form-field-context',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'
import { GrFormField, GrInput } from '@feugene/granularity'

const email = ref('john')
const error = computed(() =>
  email.value && !email.value.includes('@') ? 'Enter a valid email address' : undefined,
)
</script>

<template>
  <GrFormField label="Email" required hint="We'll never share your email." :error="error">
    <GrInput v-model="email" type="email" placeholder="you@example.com" />
  </GrFormField>
</template>`,
    note: 'GrInput / GrSelect / GrTextarea внутри `GrFormField` подхватывают контекст автоматически — id/aria прокидывать не нужно.',
  },
  {
    id: 'form-field-basic-label',
    title: 'Basic label and `forId` wiring',
    description: 'Минимальный сценарий показывает, как `GrFormField` связывает label и control, не навязывая конкретный input-тип.',
    status: 'ready',
    previewKey: 'gr-form-field-basic-label',
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
    previewKey: 'gr-form-field-error-state',
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
    previewKey: 'gr-form-field-custom-label',
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
