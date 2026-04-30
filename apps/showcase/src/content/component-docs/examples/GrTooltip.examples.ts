import type { ShowcaseComponentExampleDoc } from '../types'

export const grTooltipExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tooltip-inline-help',
    title: 'Inline help near form labels',
    description: 'Самый частый сценарий для `GrTooltip` — короткое пояснение рядом с label или small helper-control.',
    status: 'ready',
    previewKey: 'ds-tooltip-inline-help',
    code: `<script setup lang="ts">
import { GrTooltip } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <label class="inline-flex items-center gap-2 text-sm font-600">
      Notification email
      <GrTooltip text="We use this address only for billing alerts and incident updates." />
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
import { GrTooltip } from '@feugene/granularity'
</script>

<template>
  <GrTooltip text="Custom slot lets you attach the tooltip to any trigger element.">
    <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--brd)] bg-[var(--card)]">
      ?
    </button>
  </GrTooltip>
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

import { GrInput, GrTooltip } from '@feugene/granularity'

const tooltipText = ref('Escalation policy will be applied to new alerts only.')
const iconColor = ref('var(--warning)')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-600">Custom tone</span>
      <GrTooltip :text="tooltipText" :icon-color="iconColor" />
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <GrInput v-model="tooltipText" placeholder="Tooltip text" />
      <GrInput v-model="iconColor" placeholder="var(--warning) / #f59e0b" />
    </div>
  </div>
</template>`,
  },
]
