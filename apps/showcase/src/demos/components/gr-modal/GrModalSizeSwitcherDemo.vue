<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const activeSize = ref<'sm' | 'lg'>('sm')
const open = ref(false)

function openWithSize(size: 'sm' | 'lg') {
  activeSize.value = size
  open.value = true
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-3">
      <GrButton variant="outline" @click="openWithSize('sm')">
        {{ t('components.GrModal.size.compact') }}
      </GrButton>
      <GrButton @click="openWithSize('lg')">
        {{ t('components.GrModal.size.wide') }}
      </GrButton>
    </div>

    <GrModal v-model="open" :size="activeSize">
      <div class="grid gap-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-[var(--gr-fg)]">
              {{ t('components.GrModal.size.activeSize', { size: activeSize }) }}
            </div>
            <div class="text-sm text-[var(--gr-muted-fg)]">
              {{ t('components.GrModal.size.body') }}
            </div>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl border border-[var(--gr-brd)] p-3 text-sm">
            {{ t('components.GrModal.size.summaryBlock') }}
          </div>
          <div class="rounded-2xl border border-[var(--gr-brd)] p-3 text-sm">
            {{ t('components.GrModal.size.secondaryBlock') }}
          </div>
        </div>

        <GrButton class="justify-self-start" @click="open = false">
          {{ t('components.GrModal.size.done') }}
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>
