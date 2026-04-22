<script setup lang="ts">
import { ref } from 'vue'

import type { DsSegmentedOption } from '@feugene/granularity'
import { DsSegmented } from '@feugene/granularity'

import IconCalendarDays from '~icons/lucide/calendar-days'
import IconLayoutGrid from '~icons/lucide/layout-grid'
import IconRows3 from '~icons/lucide/rows-3'
import IconSunMoon from '~icons/lucide/sun-moon'

const dashboardView = ref<'board' | 'timeline' | 'calendar'>('board')
const iconOnlyView = ref<'board' | 'timeline' | 'calendar'>('timeline')

const dashboardOptions: DsSegmentedOption[] = [
  { value: 'board', label: 'Board', icon: IconLayoutGrid },
  { value: 'timeline', label: 'Timeline', icon: IconRows3 },
  { value: 'calendar', label: 'Calendar', icon: IconCalendarDays },
]

const iconOnlyOptions: DsSegmentedOption[] = [
  { value: 'board', icon: IconLayoutGrid },
  { value: 'timeline', icon: IconRows3 },
  { value: 'calendar', icon: IconCalendarDays },
]
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-2">
    <div class="grid gap-3 rounded-[24px] border border-[var(--brd)] bg-[var(--card)] p-5">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Icon + label
      </div>
      <DsSegmented
        v-model="dashboardView"
        :options="dashboardOptions"
        :indicator-duration="260"
        aria-label="Dashboard view"
      />
    </div>

    <div class="grid gap-3 rounded-[24px] border border-[var(--brd)] bg-[var(--card)] p-5">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Icon-only with scoped slot
      </div>
      <DsSegmented
        v-model="iconOnlyView"
        :options="iconOnlyOptions"
        size="sm"
        :indicator-duration="420"
        aria-label="Compact view switcher"
      >
        <template #default="{ option, selected }">
          <component :is="option.icon ?? IconSunMoon" class="h-4 w-4" :class="selected ? '' : 'opacity-70'" />
        </template>
      </DsSegmented>
    </div>
  </div>
</template>