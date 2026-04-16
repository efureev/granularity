<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsButtonGroup, DsCard } from '@feugene/granularity'

const activeFilter = ref<'all' | 'failed' | 'review'>('all')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <DsButtonGroup aria-label="Filter pipelines">
      <DsButton :variant="activeFilter === 'all' ? 'primary' : 'outline'" @click="activeFilter = 'all'">
        All
      </DsButton>
      <DsButton :variant="activeFilter === 'failed' ? 'primary' : 'outline'" @click="activeFilter = 'failed'">
        Failed
        <DsBadge class="ml-2" size="sm" radius="semi" dark tone="azure">3</DsBadge>
      </DsButton>
      <DsButton :variant="activeFilter === 'review' ? 'primary' : 'outline'" @click="activeFilter = 'review'">
        Needs review
        <DsBadge class="ml-2" size="sm" tone="warning" radius="semi">7</DsBadge>
      </DsButton>
    </DsButtonGroup>

    <DsCard class="p-4 text-sm text-[var(--muted-fg)]">
      Active filter: <span class="font-semibold text-[var(--fg)]">{{ activeFilter }}</span>
    </DsCard>
  </div>
</template>
