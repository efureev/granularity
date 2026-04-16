import type { ShowcaseComponentExampleDoc } from '../types'

export const dsInputExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'input-validation-states',
    title: 'Validation states and native input types',
    description: 'Одна карточка показывает сразу базовый текстовый сценарий, email-валидацию и search-mode, чтобы было видно native-поведение без потери design-system оболочки.',
    status: 'ready',
    previewKey: 'ds-input-validation-states',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsInput, DsSwitch } from '@feugene/granularity'

const displayName = ref('Ada Lovelace')
const email = ref('ops@granularity.dev')
const search = ref('')
const invalid = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-3">
      <DsFormField label="Display name">
        <DsInput v-model="displayName" placeholder="Ada Lovelace" />
      </DsFormField>

      <DsFormField label="Work email" :error="invalid ? 'Use a valid email address' : undefined">
        <DsInput
          v-model="email"
          type="email"
          placeholder="name@example.com"
          :invalid="invalid"
          :state="invalid ? 'danger' : 'success'"
        />
      </DsFormField>

      <DsFormField label="Search input">
        <DsInput v-model="search" type="search" placeholder="Search components" />
      </DsFormField>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Validation toggle
      </div>
      <DsSwitch v-model="invalid" size="sm">
        Show invalid email state
      </DsSwitch>
      <div class="text-sm text-[var(--muted-fg)]">
        Search query: {{ search || '—' }}
      </div>
    </div>
  </div>
</template>`,
  },
  {
    id: 'input-addons-width-guards',
    title: 'Prefix and suffix slots with width guards',
    description: 'Сценарий фокусируется на add-on slots и ограничении ширины, чтобы длинные подписи не ломали layout формы.',
    status: 'ready',
    previewKey: 'ds-input-addons-width-guards',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsInput } from '@feugene/granularity'

const amount = ref('12 540')
const iban = ref('DE89 3704 0044 0532 0130 00')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <DsFormField label="Currency input">
      <DsInput v-model="amount" placeholder="0.00">
        <template #prefix>₽</template>
        <template #suffix>RUB</template>
      </DsInput>
    </DsFormField>

    <DsFormField label="Long add-ons with width guards">
      <DsInput
        v-model="iban"
        placeholder="IBAN"
        prefix-min-width="3rem"
        prefix-max-width="7rem"
        suffix-min-width="3rem"
        suffix-max-width="8rem"
      >
        <template #prefix>International account</template>
        <template #suffix>Primary settlement account</template>
      </DsInput>
    </DsFormField>
  </div>
</template>`,
  },
  {
    id: 'input-size-and-alignment',
    title: 'Size scale and text alignment',
    description: 'Показываем, что `DsInput` умеет жить и в компактных toolbars, и в крупных form-layout, а выравнивание текста настраивается отдельно от размера.',
    status: 'ready',
    previewKey: 'ds-input-size-and-alignment',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsInput, DsRadioGroup } from '@feugene/granularity'

const alignment = ref<'left' | 'center' | 'right'>('left')
const alignmentOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
]

const sizeValues = {
  xs: ref('xs size'),
  sm: ref('sm size'),
  md: ref('md size'),
  lg: ref('lg size'),
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-2 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Text alignment
      </div>
      <DsRadioGroup v-model="alignment" :options="alignmentOptions" variant="button" size="sm" />
      <DsInput :model-value="'Aligned to ' + alignment" :text-align="alignment" placeholder="Editable content" />
    </div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div class="grid gap-2">
        <div class="text-xs uppercase tracking-[0.16em] text-[var(--muted-fg)]">xs</div>
        <DsInput v-model="sizeValues.xs.value" size="xs" placeholder="Extra small" />
      </div>
      <div class="grid gap-2">
        <div class="text-xs uppercase tracking-[0.16em] text-[var(--muted-fg)]">sm</div>
        <DsInput v-model="sizeValues.sm.value" size="sm" placeholder="Small" />
      </div>
      <div class="grid gap-2">
        <div class="text-xs uppercase tracking-[0.16em] text-[var(--muted-fg)]">md</div>
        <DsInput v-model="sizeValues.md.value" size="md" placeholder="Medium" />
      </div>
      <div class="grid gap-2">
        <div class="text-xs uppercase tracking-[0.16em] text-[var(--muted-fg)]">lg</div>
        <DsInput v-model="sizeValues.lg.value" size="lg" placeholder="Large" />
      </div>
    </div>
  </div>
</template>`,
  },
]
