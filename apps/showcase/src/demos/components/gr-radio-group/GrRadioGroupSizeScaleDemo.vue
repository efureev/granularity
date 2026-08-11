<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrRadioGroup } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const viewOptions = [
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'table', label: 'Table' },
]

const planOptions = [
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team' },
]

// По значению на ступень: одна модель на все четыре сделала бы выбор общим, и
// разница между ступенями читалась бы хуже.
const buttonView = ref<Record<string, string>>({ xs: 'board', sm: 'calendar', md: 'board', lg: 'table' })
const radioboxPlan = ref<Record<string, string>>({ xs: 'free', sm: 'team', md: 'free', lg: 'team' })
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-3">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        variant="button" — ступень в ступень с GrButton
      </div>

      <div
        v-for="size in sizes"
        :key="`button-${size}`"
        class="flex flex-wrap items-center gap-3"
      >
        <code class="w-8 text-xs text-[var(--gr-muted-fg)]">{{ size }}</code>
        <GrRadioGroup
          v-model="buttonView[size]"
          :options="viewOptions"
          variant="button"
          :size="size"
        />
        <!-- Кнопка рядом той же ступени: у кнопочного варианта карта размеров общая
             с `GrButton`, и высоты обязаны совпадать. -->
        <GrButton :size="size" variant="outline">
          GrButton {{ size }}
        </GrButton>
      </div>
    </div>

    <div class="grid gap-3">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        variant="radiobox" — коробка, точка и подпись тоже по ступеням
      </div>

      <div
        v-for="size in sizes"
        :key="`radiobox-${size}`"
        class="flex flex-wrap items-center gap-3"
      >
        <code class="w-8 text-xs text-[var(--gr-muted-fg)]">{{ size }}</code>
        <GrRadioGroup
          v-model="radioboxPlan[size]"
          :options="planOptions"
          :size="size"
          orientation="horizontal"
        />
      </div>
    </div>
  </div>
</template>
