<script setup lang="ts">
import { reactive } from 'vue'

import { GrBadge, GrSidebar, GrSwitch } from '@feugene/granularity'

const filters = reactive({
  active: true,
  assigned: false,
  overdue: true,
})
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[260px_minmax(0,1fr)]">
    <GrSidebar title="Filters" subtitle="Sticky control rail">
      <div class="grid gap-3">
        <label class="flex items-center justify-between gap-3 text-sm">
          Active only
          <GrSwitch v-model="filters.active" />
        </label>
        <label class="flex items-center justify-between gap-3 text-sm">
          Assigned to me
          <GrSwitch v-model="filters.assigned" />
        </label>
        <label class="flex items-center justify-between gap-3 text-sm">
          Overdue
          <GrSwitch v-model="filters.overdue" />
        </label>
      </div>
    </GrSidebar>

    <div class="rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4">
      <div class="flex flex-wrap gap-2">
        <GrBadge :tone="filters.active ? 'primary' : 'neutral'">
          Active: {{ filters.active ? 'on' : 'off' }}
        </GrBadge>
        <GrBadge :tone="filters.assigned ? 'primary' : 'neutral'">
          Assigned: {{ filters.assigned ? 'on' : 'off' }}
        </GrBadge>
        <GrBadge :tone="filters.overdue ? 'primary' : 'neutral'">
          Overdue: {{ filters.overdue ? 'on' : 'off' }}
        </GrBadge>
      </div>
    </div>
  </div>
</template>