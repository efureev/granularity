import type { ShowcaseComponentExampleDoc } from '../types'

export const grCheckboxExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'checkbox-state-matrix',
    title: 'Checked, unchecked and locked states',
    description: 'Показываем базовую матрицу состояний: управляемые чекбоксы, отдельный disabled-case и компактную сводку по текущему выбору.',
    status: 'ready',
    previewKey: 'ds-checkbox-state-matrix',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrCheckbox, GrSwitch } from '@feugene/granularity'

const weeklyDigest = ref(true)
const incidentAlerts = ref(false)
const controlsDisabled = ref(false)

const enabledCount = computed(() => [weeklyDigest.value, incidentAlerts.value].filter(Boolean).length)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
    <div class="grid gap-3">
      <GrCheckbox v-model="weeklyDigest" :disabled="controlsDisabled">
        Weekly product digest
      </GrCheckbox>
      <GrCheckbox v-model="incidentAlerts" :disabled="controlsDisabled">
        Incident alerts
      </GrCheckbox>
      <GrCheckbox :model-value="true" disabled>
        Security bulletins are always enabled
      </GrCheckbox>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div>
        <div class="text-sm font-semibold text-[var(--fg)]">
          Selection summary
        </div>
        <div class="text-sm text-[var(--muted-fg)]">
          {{ enabledCount }} of 2 optional channels are active.
        </div>
      </div>

      <GrSwitch v-model="controlsDisabled" size="sm">
        Lock editable options
      </GrSwitch>
    </div>
  </div>
</template>`,
  },
  {
    id: 'checkbox-interactive-label',
    title: 'Interactive content inside the label slot',
    description: 'Отдельный сценарий фиксирует важную интеграционную деталь: ссылки и кнопки внутри slot-контента не должны случайно переключать чекбокс.',
    status: 'ready',
    previewKey: 'ds-checkbox-interactive-label',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrCheckbox } from '@feugene/granularity'

const accepted = ref(false)
const previewOpens = ref(0)
</script>

<template>
  <div class="grid gap-4">
    <GrCheckbox v-model="accepted">
      <span class="inline-flex flex-wrap items-center gap-2 text-sm">
        I accept the rollout policy and reviewed the
        <a
          class="font-medium text-[var(--primary)] underline underline-offset-2"
          href="https://example.com/policy"
          target="_blank"
          rel="noreferrer"
          @click.stop
        >
          privacy policy
        </a>
        <button
          type="button"
          class="rounded-full border border-[var(--brd)] px-2 py-1 text-xs font-medium text-[var(--fg)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          @click.stop="previewOpens += 1"
        >
          Preview changes
        </button>
      </span>
    </GrCheckbox>

    <div class="rounded-2xl border border-dashed border-[var(--brd)] bg-[var(--muted)]/35 p-4 text-sm text-[var(--muted-fg)]">
      Checkbox value: <span class="font-semibold text-[var(--fg)]">{{ accepted ? 'accepted' : 'pending' }}</span> ·
      Preview clicked {{ previewOpens }} times.
    </div>
  </div>
</template>`,
  },
  {
    id: 'checkbox-native-form',
    title: 'Native form submission semantics',
    description: 'Показываем, какие `name`/`value` пары реально уходят в `FormData`, чтобы поведение чекбокса было предсказуемо в обычных формах и без обвязки form-library.',
    status: 'ready',
    previewKey: 'ds-checkbox-native-form',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCheckbox } from '@feugene/granularity'

const marketing = ref(true)
const productUpdates = ref(false)
const submission = ref('Submit the form to inspect native checkbox values.')

function onSubmit(event: SubmitEvent): void {
  event.preventDefault()

  const formData = new FormData(event.currentTarget as HTMLFormElement)

  submission.value = JSON.stringify(Object.fromEntries(formData.entries()), null, 2)
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
    <form class="grid gap-3" @submit="onSubmit">
      <GrCheckbox v-model="marketing" name="marketing" value="enabled">
        Marketing updates
      </GrCheckbox>
      <GrCheckbox v-model="productUpdates" name="productUpdates" value="beta">
        Beta feature updates
      </GrCheckbox>

      <div class="flex items-center gap-3 pt-2">
        <GrButton type="submit" size="sm">Read form data</GrButton>
      </div>
    </form>

    <pre class="overflow-x-auto rounded-2xl border border-[var(--brd)] bg-[var(--fg)] p-4 text-xs text-[var(--bg)]">{{ submission }}</pre>
  </div>
</template>`,
  },
]
