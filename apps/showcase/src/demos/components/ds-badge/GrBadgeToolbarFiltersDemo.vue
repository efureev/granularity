<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrButtonGroup, GrCard } from '@feugene/granularity'

const activeFilter = ref<'all' | 'failed' | 'review'>('all')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrButtonGroup aria-label="Filter pipelines">
      <GrButton :variant="activeFilter === 'all' ? 'primary' : 'outline'" @click="activeFilter = 'all'">
        All
      </GrButton>
      <GrButton :variant="activeFilter === 'failed' ? 'primary' : 'outline'" @click="activeFilter = 'failed'">
        Failed
        <GrBadge class="ml-2" size="sm" radius="semi" dark tone="azure">3</GrBadge>
      </GrButton>
      <GrButton :variant="activeFilter === 'review' ? 'primary' : 'outline'" @click="activeFilter = 'review'">
        Needs review
        <GrBadge class="ml-2" size="sm" tone="warning" radius="semi">7</GrBadge>
      </GrButton>
    </GrButtonGroup>

    <GrCard class="p-4 text-sm text-[var(--muted-fg)]">
      Active filter: <span class="font-semibold text-[var(--fg)]">{{ activeFilter }}</span>
    </GrCard>
  </div>
</template>
