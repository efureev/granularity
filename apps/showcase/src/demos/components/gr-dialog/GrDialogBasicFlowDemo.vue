<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDialog } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      {{ t('components.GrDialog.basic.open') }}
    </GrButton>

    <GrDialog v-model="open" :title="t('components.GrDialog.basic.title')" size="sm">
      <div class="grid gap-4 text-sm text-[var(--gr-muted-fg)]">
        <p>
          {{ t('components.GrDialog.basic.body') }}
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <GrBadge size="sm" tone="info">
            {{ t('components.GrDialog.basic.recipients') }}
          </GrBadge>
          <GrBadge size="sm" tone="neutral">
            {{ t('components.GrDialog.basic.draftReady') }}
          </GrBadge>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            {{ t('components.GrDialog.basic.cancel') }}
          </GrButton>
          <GrButton @click="open = false">
            {{ t('components.GrDialog.basic.publish') }}
          </GrButton>
        </div>
      </template>
    </GrDialog>
  </div>
</template>
