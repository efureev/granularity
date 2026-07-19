<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrCollapse, GrCollapseItem } from '@feugene/granularity'

const expanded = ref<Array<string | number>>(['summary', 'alerts'])
</script>

<template>
  <div class="grid gap-3">
    <div class="text-sm text-[var(--muted-fg)]">
      Multi-expand mode works well for dense dashboards where several sections should stay visible together.
    </div>

    <GrCollapse v-model="expanded" :divided="false">
      <GrCollapseItem name="summary">
        <template #title>
          <div class="flex items-center gap-2 text-sm font-600">
            Executive summary
            <GrBadge size="sm" tone="success">Ready</GrBadge>
          </div>
        </template>

        Key financial highlights, ownership notes and recent approvals can stay open side by side.
      </GrCollapseItem>

      <GrCollapseItem name="alerts">
        <template #title>
          <div class="flex items-center gap-2 text-sm font-600">
            Risk alerts
            <GrBadge size="sm" tone="warning">2 active</GrBadge>
          </div>
        </template>

        Use a custom title slot when you need counters, badges or richer inline status markers.
      </GrCollapseItem>

      <GrCollapseItem name="history" title="Change history">
        Keep audit notes collapsed by default until the operator explicitly opens them.
      </GrCollapseItem>
    </GrCollapse>
  </div>
</template>