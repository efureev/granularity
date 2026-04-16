import type { ShowcaseComponentExampleDoc } from '../types'

export const dsRadioExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'radio-standalone-controlled',
    title: 'Standalone radios with shared model',
    description: 'Минимальный контролируемый сценарий без group-wrapper, полезный там, где нужно вручную разложить отдельные radio по кастомному layout.',
    status: 'ready',
    previewKey: 'ds-radio-standalone-controlled',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsRadio } from '@feugene/granularity'

const delivery = ref('weekly')

const selectedLabel = computed(() => {
  const labels: Record<string, string> = {
    daily: 'Daily digest',
    weekly: 'Weekly digest',
    monthly: 'Monthly report',
  }

  return labels[delivery.value] ?? delivery.value
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
    <div class="grid gap-3">
      <DsRadio v-model="delivery" name="digest-frequency" value="daily">
        Daily digest
      </DsRadio>
      <DsRadio v-model="delivery" name="digest-frequency" value="weekly">
        Weekly digest
      </DsRadio>
      <DsRadio v-model="delivery" name="digest-frequency" value="monthly">
        Monthly report
      </DsRadio>
    </div>

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      Current delivery cadence:
      <div class="mt-2 text-base font-semibold text-[var(--fg)]">
        {{ selectedLabel }}
      </div>
    </div>
  </div>
</template>`,
  },
  {
    id: 'radio-button-tone',
    title: 'Button tone for segmented controls',
    description: 'Отдельный пример для `tone="button"`: по API это всё тот же radio, но визуально он работает как сегментированный toolbar-control.',
    status: 'ready',
    previewKey: 'ds-radio-button-variant',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsRadio } from '@feugene/granularity'

const density = ref('balanced')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <DsRadio v-model="density" value="compact" variant="button" size="sm">
        Compact
      </DsRadio>
      <DsRadio v-model="density" value="balanced" variant="button" size="sm">
        Balanced
      </DsRadio>
      <DsRadio v-model="density" value="comfortable" variant="button" size="sm">
        Comfortable
      </DsRadio>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--brd)] bg-[var(--muted)]/35 p-4 text-sm text-[var(--muted-fg)]">
      Button-like radios keep the same v-model contract while matching toolbar and segmented-control layouts.
    </div>
  </div>
</template>`,
  },
  {
    id: 'radio-group-inheritance',
    title: 'Inherited name, size and disabled state from `DsRadioGroup`',
    description: 'Этот сценарий важен именно для `DsRadio`: компонент должен корректно читать group-context и не дублировать базовые props на каждом элементе.',
    status: 'ready',
    previewKey: 'ds-radio-group-inheritance',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsRadio, DsRadioGroup, DsSwitch } from '@feugene/granularity'

const environment = ref('staging')
const disabled = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <DsRadioGroup v-model="environment" name="target-environment" :disabled="disabled">
      <DsRadio value="local">Local preview</DsRadio>
      <DsRadio value="staging">Staging</DsRadio>
      <DsRadio value="production">Production</DsRadio>
    </DsRadioGroup>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <DsSwitch v-model="disabled" size="sm">
        Disable full group
      </DsSwitch>
      <div class="text-sm text-[var(--muted-fg)]">
        Active target: <span class="font-semibold text-[var(--fg)]">{{ environment }}</span>
      </div>
    </div>
  </div>
</template>`,
  },
]
