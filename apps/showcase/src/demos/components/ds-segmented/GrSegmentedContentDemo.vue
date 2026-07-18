<script setup lang="ts">
import { ref } from 'vue'

import type { GrSegmentedOption } from '@feugene/granularity'
import { GrSegmented } from '@feugene/granularity'

import IconCalendarDays from '~icons/lucide/calendar-days'
import IconLayoutGrid from '~icons/lucide/layout-grid'
import IconRows3 from '~icons/lucide/rows-3'
import IconSunMoon from '~icons/lucide/sun-moon'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const dashboardView = ref<'board' | 'timeline' | 'calendar'>('board')
const iconOnlyView = ref<'board' | 'timeline' | 'calendar'>('timeline')

const dashboardOptions: GrSegmentedOption[] = [
  { value: 'board', label: 'Board', icon: IconLayoutGrid },
  { value: 'timeline', label: 'Timeline', icon: IconRows3 },
  { value: 'calendar', label: 'Calendar', icon: IconCalendarDays },
]

const iconOnlyOptions: GrSegmentedOption[] = [
  { value: 'board', icon: IconLayoutGrid },
  { value: 'timeline', icon: IconRows3 },
  { value: 'calendar', icon: IconCalendarDays },
]
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-2">
    <div class="grid gap-3 rounded-[24px] border border-[var(--brd)] bg-[var(--card)] p-5">
      <div class="text-sm font-semibold text-[var(--fg)]">
        {{ t('components.GrSegmented.content.iconLabel') }}
      </div>
      <GrSegmented
        v-model="dashboardView"
        :options="dashboardOptions"
        :indicator-duration="260"
        :aria-label="t('components.GrSegmented.content.dashboardAria')"
      />
    </div>

    <div class="grid gap-3 rounded-[24px] border border-[var(--brd)] bg-[var(--card)] p-5">
      <div class="text-sm font-semibold text-[var(--fg)]">
        {{ t('components.GrSegmented.content.iconOnly') }}
      </div>
      <GrSegmented
        v-model="iconOnlyView"
        :options="iconOnlyOptions"
        size="sm"
        :indicator-duration="420"
        :aria-label="t('components.GrSegmented.content.compactAria')"
      >
        <template #default="{ option, selected }">
          <component :is="option.icon ?? IconSunMoon" class="h-4 w-4" :class="selected ? '' : 'opacity-70'" />
        </template>
      </GrSegmented>
    </div>
  </div>
</template>