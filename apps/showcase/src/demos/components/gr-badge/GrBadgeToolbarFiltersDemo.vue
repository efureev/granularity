<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrButtonGroup, GrCard } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const activeFilter = ref<'all' | 'failed' | 'review'>('all')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrButtonGroup :aria-label="t('components.GrBadge.toolbar.filterPipelines')">
      <GrButton :variant="activeFilter === 'all' ? 'primary' : 'outline'" @click="activeFilter = 'all'">
        {{ t('components.GrBadge.toolbar.all') }}
      </GrButton>
      <GrButton :variant="activeFilter === 'failed' ? 'primary' : 'outline'" @click="activeFilter = 'failed'">
        {{ t('components.GrBadge.toolbar.failed') }}
        <GrBadge class="ml-2" size="sm" radius="semi" dark tone="azure">3</GrBadge>
      </GrButton>
      <GrButton :variant="activeFilter === 'review' ? 'primary' : 'outline'" @click="activeFilter = 'review'">
        {{ t('components.GrBadge.toolbar.needsReview') }}
        <GrBadge class="ml-2" size="sm" tone="warning" radius="semi">7</GrBadge>
      </GrButton>
    </GrButtonGroup>

    <GrCard class="p-4 text-sm text-[var(--muted-fg)]">
      {{ t('components.GrBadge.toolbar.activeFilter') }} <span class="font-semibold text-[var(--fg)]">{{ activeFilter }}</span>
    </GrCard>
  </div>
</template>
