<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      {{ t('components.GrModal.basic.open') }}
    </GrButton>

    <GrModal v-model="open" size="sm">
      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          {{ t('components.GrModal.basic.shellTitle') }}
        </div>
        <div class="text-sm text-[var(--gr-muted-fg)]">
          {{ t('components.GrModal.basic.shellBody') }}
        </div>
        <GrButton class="justify-self-start" @click="open = false">
          {{ t('components.GrModal.basic.close') }}
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>
