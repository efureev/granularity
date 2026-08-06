import type { ShowcaseComponentExampleDoc } from '../types'

export const grTooltipExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tooltip-inline-help',
    title: 'Inline help near form labels',
    description: 'Самый частый сценарий для `GrTooltip` — короткое пояснение рядом с label или small helper-control.',
    status: 'ready',
    previewKey: 'gr-tooltip-inline-help',
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
    previewKey: 'gr-tooltip-custom-trigger',
    code: `<script setup lang="ts">
import { GrTooltip } from '@feugene/granularity'
</script>

<template>
  <GrTooltip text="Custom slot lets you attach the tooltip to any trigger element.">
    <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gr-brd)] bg-[var(--gr-card)]">
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
    previewKey: 'gr-tooltip-custom-tone',
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
  {
    id: 'tooltip-sizes',
    title: 'Шкала размеров',
    description: 'Масштабируются и панель, и дефолтная триггер-иконка; предельная ширина растёт вместе с кеглем, чтобы строка не рвалась.',
    status: 'ready',
    previewKey: 'gr-tooltip-sizes',
    code: `<script setup lang="ts">
import { GrTooltip } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-2">
      <span class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </span>

      <GrTooltip :size="size" text="Billing runs on the first day of each month." />
    </div>
  </div>
</template>`,
  },
  {
    id: 'tooltip-placement',
    title: 'Сторона, задержка и disabled',
    description: 'Подсказка встаёт с любой стороны, `openDelay` убирает мигание на плотной панели кнопок, а слот-триггер не добавляет второй остановки `Tab`.',
    status: 'ready',
    previewKey: 'gr-tooltip-placement',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import type { GrTooltipPlacement } from '@feugene/granularity'
import { GrButton, GrSegmented, GrSwitch, GrTooltip } from '@feugene/granularity'

const placement = ref<GrTooltipPlacement>('top')
const openDelay = ref(400)
const disabled = ref(false)

const placements = [
  { value: 'top', label: 'top' },
  { value: 'right', label: 'right' },
  { value: 'bottom', label: 'bottom' },
  { value: 'left', label: 'left' },
] as const

const actions = ['Merge', 'Revert', 'Rebase'] as const
</script>

<template>
  <div class="grid gap-5">
    <div class="flex flex-wrap items-center gap-4">
      <GrSegmented v-model="placement" size="sm" :options="placements" />

      <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
        <GrSwitch v-model="disabled" size="sm" />
        disabled
      </label>
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-6">
      <div class="flex flex-wrap items-center gap-2">
        <GrTooltip
          v-for="action in actions"
          :key="action"
          :placement="placement"
          :open-delay="openDelay"
          :close-delay="120"
          :disabled="disabled"
          :text="\`\${action} — задержка \${openDelay} мс, подсказка не мигает при проведении курсором\`"
        >
          <GrButton size="sm" variant="outline">
            {{ action }}
          </GrButton>
        </GrTooltip>
      </div>

      <p class="mt-4 text-sm text-[var(--gr-muted-fg)]">
        Обёртка не добавляет второй остановки Tab: описание уезжает на саму
        кнопку, и до подсказки доходит и клавиатура, и скринридер.
      </p>
    </div>
  </div>
</template>`,
  },
]
