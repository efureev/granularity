import type { ShowcaseComponentExampleDoc } from '../types'

export const dsTooltipExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tooltip-inline-help',
    title: 'Inline help near form labels',
    description: 'Самый частый сценарий для `DsTooltip` — короткое пояснение рядом с label или small helper-control.',
    status: 'ready',
    previewKey: 'ds-tooltip-inline-help',
    code: `<script setup lang="ts">
import { DsTooltip } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <label class="inline-flex items-center gap-2 text-sm font-600">
      Notification email
      <DsTooltip text="We use this address only for billing alerts and incident updates." />
    </label>
  </div>
</template>`,
  },
  {
    id: 'tooltip-custom-trigger',
    title: 'Custom trigger via default slot',
    description: 'Показываем, что tooltip не ограничен встроенной info-иконкой: любой trigger можно прокинуть через default slot.',
    status: 'ready',
    previewKey: 'ds-tooltip-custom-trigger',
    code: `<script setup lang="ts">
import { DsTooltip } from '@feugene/granularity'
</script>

<template>
  <DsTooltip text="Custom slot lets you attach the tooltip to any trigger element.">
    <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--brd)] bg-[var(--card)]">
      ?
    </button>
  </DsTooltip>
</template>`,
  },
  {
    id: 'tooltip-custom-tone',
    title: 'Editable copy and icon tone',
    description: 'Выделяем вторую важную возможность компонента: управлять plain-text сообщением и цветом trigger-иконки из внешнего state.',
    status: 'ready',
    previewKey: 'ds-tooltip-custom-tone',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsInput, DsTooltip } from '@feugene/granularity'

const tooltipText = ref('Escalation policy will be applied to new alerts only.')
const iconColor = ref('var(--warning)')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-600">Custom tone</span>
      <DsTooltip :text="tooltipText" :icon-color="iconColor" />
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <DsInput v-model="tooltipText" placeholder="Tooltip text" />
      <DsInput v-model="iconColor" placeholder="var(--warning) / #f59e0b" />
    </div>
  </div>
</template>`,
  },
]
