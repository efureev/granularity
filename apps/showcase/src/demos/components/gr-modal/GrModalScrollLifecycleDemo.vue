<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrModalScrollBehavior } from '@feugene/granularity'
import { GrBadge, GrButton, GrModal, GrSegmented } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()

const open = ref(false)
const scrollBehavior = ref<GrModalScrollBehavior>('inside')
const phase = ref<'idle' | 'opened' | 'closed'>('idle')

const rows = Array.from({ length: 24 }, (_, index) => index + 1)

const phaseTone = computed(() => (phase.value === 'opened' ? 'success' : 'neutral'))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrSegmented
        v-model="scrollBehavior"
        size="sm"
        :options="[
          { value: 'inside', label: 'inside' },
          { value: 'outside', label: 'outside' },
        ]"
      />
      <GrButton class="justify-self-start" @click="open = true">
        {{ t('components.GrModal.scroll.open') }}
      </GrButton>
      <GrBadge :tone="phaseTone">
        {{ t(`components.GrModal.scroll.phase.${phase}`) }}
      </GrBadge>
    </div>

    <GrModal
      v-model="open"
      size="md"
      :scroll-behavior="scrollBehavior"
      @opened="phase = 'opened'"
      @closed="phase = 'closed'"
    >
      <!-- Слот #title — рекомендуемый путь: он и виден, и даёт окну имя. -->
      <template #title>
        <div class="border-b border-[var(--gr-brd)] px-4 py-3 text-sm font-semibold text-[var(--gr-fg)]">
          {{ t('components.GrModal.scroll.title') }}
        </div>
      </template>

      <div class="grid gap-2 p-4">
        <div class="text-sm text-[var(--gr-muted-fg)]">
          {{ t('components.GrModal.scroll.body') }}
        </div>
        <div
          v-for="row in rows"
          :key="row"
          class="rounded-xl border border-[var(--gr-brd)] px-3 py-2 text-sm"
        >
          {{ t('components.GrModal.scroll.row', { index: row }) }}
        </div>
        <GrButton class="justify-self-start" @click="open = false">
          {{ t('components.GrModal.scroll.close') }}
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>
