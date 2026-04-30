import type { ShowcaseComponentExampleDoc } from '../types'

export const grTextareaExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'textarea-rows-layout',
    title: 'Default and expanded rows',
    description: 'Базовый сценарий для short-form и long-form контента: одна и та же textarea может быть компактной или сразу подготовленной под большой объём текста.',
    status: 'ready',
    previewKey: 'ds-textarea-rows-layout',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrTextarea } from '@feugene/granularity'

const shortNote = ref('Release notes highlight the latest API additions.')
const longNote = ref('This textarea starts taller and fits editorial copy, migration notes or incident postmortems.')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Default rows">
      <GrTextarea v-model="shortNote" placeholder="Write a short note" />
    </GrFormField>

    <GrFormField label="Expanded rows">
      <GrTextarea v-model="longNote" :rows="8" placeholder="Long-form content" />
    </GrFormField>
  </div>
</template>`,
  },
  {
    id: 'textarea-validation-states',
    title: 'Success and validation states',
    description: 'Показываем state-driven оформление и связку с form-errors без искусственной ручной таблицы API.',
    status: 'ready',
    previewKey: 'ds-textarea-validation-states',
    code: `<script setup lang="ts">
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
</template>`,
  },
  {
    id: 'textarea-disabled-state',
    title: 'Disabled review and audit mode',
    description: 'Отдельно фиксируем, как `GrTextarea` выглядит в readonly-like review flow, когда поле временно недоступно для редактирования.',
    status: 'ready',
    previewKey: 'ds-textarea-disabled-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrSwitch, GrTextarea } from '@feugene/granularity'

const disabled = ref(false)
const summary = ref('Subscribers will receive a digest every Monday at 09:00.')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <GrSwitch v-model="disabled" size="sm">
        Disable textarea
      </GrSwitch>
    </div>

    <GrFormField label="Operational notes">
      <GrTextarea v-model="summary" :disabled="disabled" :rows="6" placeholder="Editable summary" />
    </GrFormField>
  </div>
</template>`,
  },
]
