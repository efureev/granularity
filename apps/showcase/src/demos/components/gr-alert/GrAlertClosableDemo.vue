<script setup lang="ts">
import { ref } from 'vue'

import { GrAlert, GrButton, GrCard } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const visible = ref(true)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrAlert
      v-if="visible"
      :title="t('components.GrAlert.closable.title')"
      tone="warning"
      variant="light"
      closable
      @close="visible = false"
    >
      {{ t('components.GrAlert.closable.message') }}
    </GrAlert>

    <GrCard v-else class="flex min-h-[92px] items-center justify-center p-4 text-sm text-[var(--gr-muted-fg)]">
      {{ t('components.GrAlert.closable.dismissed') }}
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div>
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          {{ t('components.GrAlert.closable.eventTitle') }}
        </div>
        <div class="text-sm text-[var(--gr-muted-fg)]">
          {{ t('components.GrAlert.closable.eventDescription') }}
        </div>
      </div>

      <GrButton size="sm" variant="outline" :disabled="visible" @click="visible = true">
        {{ t('components.GrAlert.closable.restore') }}
      </GrButton>
    </GrCard>
  </div>
</template>
