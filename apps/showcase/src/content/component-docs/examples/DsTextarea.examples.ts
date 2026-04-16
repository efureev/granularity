import type { ShowcaseComponentExampleDoc } from '../types'

export const dsTextareaExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'textarea-rows-layout',
    title: 'Default and expanded rows',
    description: 'Базовый сценарий для short-form и long-form контента: одна и та же textarea может быть компактной или сразу подготовленной под большой объём текста.',
    status: 'ready',
    previewKey: 'ds-textarea-rows-layout',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsTextarea } from '@feugene/granularity'

const shortNote = ref('Release notes highlight the latest API additions.')
const longNote = ref('This textarea starts taller and fits editorial copy, migration notes or incident postmortems.')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <DsFormField label="Default rows">
      <DsTextarea v-model="shortNote" placeholder="Write a short note" />
    </DsFormField>

    <DsFormField label="Expanded rows">
      <DsTextarea v-model="longNote" :rows="8" placeholder="Long-form content" />
    </DsFormField>
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
</template>`,
  },
  {
    id: 'textarea-disabled-state',
    title: 'Disabled review and audit mode',
    description: 'Отдельно фиксируем, как `DsTextarea` выглядит в readonly-like review flow, когда поле временно недоступно для редактирования.',
    status: 'ready',
    previewKey: 'ds-textarea-disabled-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsSwitch, DsTextarea } from '@feugene/granularity'

const disabled = ref(false)
const summary = ref('Subscribers will receive a digest every Monday at 09:00.')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <DsSwitch v-model="disabled" size="sm">
        Disable textarea
      </DsSwitch>
    </div>

    <DsFormField label="Operational notes">
      <DsTextarea v-model="summary" :disabled="disabled" :rows="6" placeholder="Editable summary" />
    </DsFormField>
  </div>
</template>`,
  },
]
