<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="text-sm text-[var(--muted-fg)]">
      {{ t('components.GrModal.guarded.hint') }}
    </div>

    <GrButton variant="outline" class="justify-self-start" @click="open = true">
      {{ t('components.GrModal.guarded.open') }}
    </GrButton>

    <GrModal v-model="open" :close-on-backdrop="false" size="md">
      <div class="grid gap-4">
        <div class="grid gap-1">
          <div class="text-sm font-semibold text-[var(--fg)]">
            {{ t('components.GrModal.guarded.protectionTitle') }}
          </div>
          <div class="text-sm text-[var(--muted-fg)]">
            {{ t('components.GrModal.guarded.protectionBody') }}
          </div>
        </div>

        <div class="rounded-2xl border border-[var(--brd)] bg-[var(--muted)]/40 p-3 text-sm text-[var(--muted-fg)]">
          {{ t('components.GrModal.guarded.unsavedChanges') }}
        </div>

        <div class="flex flex-wrap gap-3">
          <GrButton variant="outline" @click="open = false">
            {{ t('components.GrModal.guarded.cancel') }}
          </GrButton>
          <GrButton @click="open = false">
            {{ t('components.GrModal.guarded.saveDraft') }}
          </GrButton>
        </div>
      </div>
    </GrModal>
  </div>
</template>
