import type { ShowcaseComponentExampleDoc } from '../types'

export const grRadioExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'radio-descriptions-and-validation',
    title: 'Описания, ошибка и числовые значения',
    description: 'Слот `#description` связан с переключателем через `aria-describedby`, `invalid` приходит от группы, а `value` — число.',
    status: 'ready',
    previewKey: 'gr-radio-descriptions',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrRadio, GrRadioGroup } from '@feugene/granularity'

// Значения числовые: перечисления в реальных формах — это обычно id, а не строка.
const planId = ref(2)

const plans = [
  { id: 1, label: 'Команда', description: 'До 10 участников, общий проект' },
  { id: 2, label: 'Бизнес', description: 'Роли, аудит-лог, приоритетная поддержка' },
  { id: 3, label: 'Enterprise', description: 'Только по договору', disabled: true },
]

const confirmed = ref(false)
const error = computed(() => (confirmed.value && planId.value === 1 ? 'Для аудит-лога нужен тариф выше' : ''))
</script>

<template>
  <div class="grid gap-4">
    <GrFormField label="Тариф" :error="error">
      <GrRadioGroup v-model="planId" name="plan" :invalid="Boolean(error)">
        <GrRadio
          v-for="plan in plans"
          :key="plan.id"
          :value="plan.id"
          :disabled="plan.disabled"
        >
          {{ plan.label }}
          <template #description>
            {{ plan.description }}
          </template>
        </GrRadio>
      </GrRadioGroup>
    </GrFormField>

    <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
      <input v-model="confirmed" type="checkbox">
      Проверять требование аудит-лога
    </label>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Выбран тариф <span class="font-semibold text-[var(--gr-fg)]">#{{ planId }}</span>.
      Группа — одна остановка \`Tab\`: внутри работают стрелки, \`Home\` и \`End\`, отключённый вариант пропускается.
    </div>
  </div>
</template>`,
  },
  {
    id: 'radio-standalone-controlled',
    title: 'Standalone radios with shared model',
    description: 'Минимальный контролируемый сценарий без group-wrapper, полезный там, где нужно вручную разложить отдельные radio по кастомному layout.',
    status: 'ready',
    previewKey: 'gr-radio-standalone-controlled',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrRadio } from '@feugene/granularity'

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
      <GrRadio v-model="delivery" name="digest-frequency" value="daily">
        Daily digest
      </GrRadio>
      <GrRadio v-model="delivery" name="digest-frequency" value="weekly">
        Weekly digest
      </GrRadio>
      <GrRadio v-model="delivery" name="digest-frequency" value="monthly">
        Monthly report
      </GrRadio>
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      Current delivery cadence:
      <div class="mt-2 text-base font-semibold text-[var(--gr-fg)]">
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
    previewKey: 'gr-radio-button-variant',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrRadio } from '@feugene/granularity'

const density = ref('balanced')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <GrRadio v-model="density" value="compact" variant="button" size="sm">
        Compact
      </GrRadio>
      <GrRadio v-model="density" value="balanced" variant="button" size="sm">
        Balanced
      </GrRadio>
      <GrRadio v-model="density" value="comfortable" variant="button" size="sm">
        Comfortable
      </GrRadio>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] bg-[var(--gr-muted)]/35 p-4 text-sm text-[var(--gr-muted-fg)]">
      Button-like radios keep the same v-model contract while matching toolbar and segmented-control layouts.
    </div>
  </div>
</template>`,
  },
  {
    id: 'radio-group-inheritance',
    title: 'Inherited name, size and disabled state from `GrRadioGroup`',
    description: 'Этот сценарий важен именно для `GrRadio`: компонент должен корректно читать group-context и не дублировать базовые props на каждом элементе.',
    status: 'ready',
    previewKey: 'gr-radio-group-inheritance',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrRadio, GrRadioGroup, GrSwitch } from '@feugene/granularity'

const environment = ref('staging')
const disabled = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrRadioGroup v-model="environment" name="target-environment" :disabled="disabled">
      <GrRadio value="local">Local preview</GrRadio>
      <GrRadio value="staging">Staging</GrRadio>
      <GrRadio value="production">Production</GrRadio>
    </GrRadioGroup>

    <div class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <GrSwitch v-model="disabled" size="sm">
        Disable full group
      </GrSwitch>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Active target: <span class="font-semibold text-[var(--gr-fg)]">{{ environment }}</span>
      </div>
    </div>
  </div>
</template>`,
  },
]
