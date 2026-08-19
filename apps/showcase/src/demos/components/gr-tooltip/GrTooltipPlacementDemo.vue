<script setup lang="ts">
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
]

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
          :text="`${action} — задержка ${openDelay} мс, подсказка не мигает при проведении курсором`"
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
</template>
