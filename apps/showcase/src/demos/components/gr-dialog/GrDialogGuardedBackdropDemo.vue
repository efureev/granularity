<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDialog } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      {{ t('components.GrDialog.guarded.open') }}
    </GrButton>

    <GrDialog v-model="open" :title="t('components.GrDialog.guarded.title')" :close-on-backdrop="false" :show-close-button="false">
      <div class="grid gap-3 text-sm text-[var(--gr-muted-fg)]">
        <p>
          {{ t('components.GrDialog.guarded.body') }}
        </p>
        <ul class="list-disc pl-5">
          <li>{{ t('components.GrDialog.guarded.pendingApprovals') }}</li>
          <li>{{ t('components.GrDialog.guarded.legalReview') }}</li>
        </ul>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            {{ t('components.GrDialog.guarded.keepDraft') }}
          </GrButton>
          <GrButton @click="open = false">
            {{ t('components.GrDialog.guarded.continueReview') }}
          </GrButton>
        </div>
      </template>
    </GrDialog>
  </div>
</template>
