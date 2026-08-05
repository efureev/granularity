import type { ShowcaseComponentExampleDoc } from '../types'

export const grCheckboxGroupExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'checkbox-group-basic',
    title: 'Multi-select from an options list',
    description: 'Одна модель `string[]` на всю группу: чекбоксам не нужен собственный `v-model`, а раскладка переключается пропом `direction`.',
    status: 'ready',
    previewKey: 'gr-checkbox-group-basic',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrCheckboxGroup, GrSegmented } from '@feugene/granularity'

const options = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
  { value: 'webhook', label: 'Webhook', disabled: true },
]

const channels = ref(['email', 'push'])
const direction = ref<'vertical' | 'horizontal'>('vertical')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
    <div class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <GrCheckboxGroup
        v-model="channels"
        name="channels"
        :options="options"
        :direction="direction"
        aria-label="Notification channels"
      />
    </div>

    <div class="grid gap-3 rounded-2xl border border-dashed border-[var(--gr-brd)] p-4">
      <GrSegmented
        v-model="direction"
        size="sm"
        :options="[
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
        ]"
      />

      <div class="text-sm text-[var(--gr-muted-fg)]">
        Selected: <span class="font-semibold text-[var(--gr-fg)]">{{ channels.join(', ') || 'none' }}</span>
      </div>
    </div>
  </div>
</template>`,
  },
  {
    id: 'checkbox-group-form',
    title: 'Validation inside GrForm',
    description: 'Обязательность объявляется через `aria-required`, а проверяет её правило формы — нативный `required` не блокирует отправку молча.',
    status: 'ready',
    previewKey: 'gr-checkbox-group-form',
    code: `<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrCheckbox, GrCheckboxGroup, GrForm, GrFormField, type GrFormRules } from '@feugene/granularity'

const options = [
  { value: 'incidents', label: 'Incidents' },
  { value: 'releases', label: 'Releases' },
  { value: 'digest', label: 'Weekly digest' },
]

const model = reactive({ scopes: [] as string[], terms: false })

// \`required\` пустым считает \`null\`/\`''\`/\`[]\`, но не \`false\`: снятый чекбокс —
// это законное значение поля. «Согласие обязательно» — это \`validator\`.
const rules: GrFormRules = {
  scopes: [{ required: true, message: 'Pick at least one subscription' }],
  terms: [{ validator: value => value === true || 'Accept the policy to continue' }],
}

const submitted = ref(false)
</script>

<template>
  <GrForm
    :model="model"
    :rules="rules"
    class="grid max-w-md gap-4"
    @submit="submitted = true"
  >
    <GrFormField name="scopes" label="Subscriptions">
      <GrCheckboxGroup v-model="model.scopes" name="scopes" :options="options" required />
    </GrFormField>

    <GrFormField name="terms" label="Policy">
      <GrCheckbox v-model="model.terms" required>
        I accept the notification policy
      </GrCheckbox>
    </GrFormField>

    <div class="flex gap-2">
      <GrButton type="submit" size="sm">
        Save preferences
      </GrButton>
    </div>

    <p v-if="submitted" class="text-sm text-[var(--gr-success-text)]">
      Saved — the form is valid.
    </p>
  </GrForm>
</template>`,
  },
]
