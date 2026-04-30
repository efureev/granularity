import type { ShowcaseComponentExampleDoc } from '../types'

export const grSwitchExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'switch-builder',
    title: 'Interactive switch constructor',
    description: 'Соберите `GrSwitch` под ваш сценарий: меняйте состояние, size, подпись и локальные color overrides, сразу получая итоговый snippet.',
    status: 'ready',
    previewKey: 'ds-switch-builder',
    code: '',
  },
  {
    id: 'switch-size-scale',
    title: 'Size scale from compact to prominent',
    description: 'Один сценарий показывает, как переключатель масштабируется от компактных control bars до больших form-sections без изменения поведения.',
    status: 'ready',
    previewKey: 'ds-switch-size-scale',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'

const smValue = ref(false)
const mdValue = ref(true)
const lgValue = ref(true)
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <GrSwitch v-model="smValue" size="sm">Small</GrSwitch>
    <GrSwitch v-model="mdValue" size="md">Medium</GrSwitch>
    <GrSwitch v-model="lgValue" size="lg">Large</GrSwitch>
  </div>
</template>`,
  },
  {
    id: 'switch-disabled-labeled',
    title: 'Labeled switches and disabled state',
    description: 'Показываем, что label живёт в default slot, а disabled-режим одинаково корректно работает и для управляемого, и для статически включённого switch.',
    status: 'ready',
    previewKey: 'ds-switch-disabled-labeled',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'

const notifications = ref(true)
const disabled = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-3">
      <GrSwitch v-model="notifications" :disabled="disabled">
        Email notifications
      </GrSwitch>
      <GrSwitch :model-value="true" disabled>
        Always on
      </GrSwitch>
    </div>

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <GrSwitch v-model="disabled" size="sm">
        Disable labeled switch
      </GrSwitch>
    </div>
  </div>
</template>`,
  },
  {
    id: 'switch-custom-colors',
    title: 'Custom active and inactive colors',
    description: 'Фиксируем одну из ключевых интеграционных возможностей компонента: локально переопределять цвета трека без изменения глобальной темы.',
    status: 'ready',
    previewKey: 'ds-switch-custom-colors',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrInput, GrSwitch } from '@feugene/granularity'

const enabled = ref(true)
const activeBackgroundColor = ref('#22c55e')
const inactiveBackgroundColor = ref('#e5e7eb')
</script>

<template>
  <div class="grid gap-4">
    <GrSwitch
      v-model="enabled"
      :active-background-color="activeBackgroundColor"
      :inactive-background-color="inactiveBackgroundColor"
    >
      Custom colors
    </GrSwitch>

    <div class="grid gap-3 md:grid-cols-2">
      <GrInput v-model="activeBackgroundColor" placeholder="#22c55e / var(--primary)" />
      <GrInput v-model="inactiveBackgroundColor" placeholder="#e5e7eb / var(--muted)" />
    </div>
  </div>
</template>`,
  },
]
