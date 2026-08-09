<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrModalScrollBehavior } from '@feugene/granularity'
import { GrBadge, GrButton, GrModal, GrSegmented } from '@feugene/granularity'

const open = ref(false)
const scrollBehavior = ref<GrModalScrollBehavior>('inside')
const phase = ref<'idle' | 'opened' | 'closed'>('idle')

const rows = Array.from({ length: 24 }, (_, index) => index + 1)

const phaseTone = computed(() => (phase.value === 'opened' ? 'success' : 'neutral'))

const phaseLabel = computed(() => ({
  idle: 'Not opened yet',
  opened: 'opened — enter animation finished',
  closed: 'closed — content is safe to unmount',
}[phase.value]))
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
        Open a long dialog
      </GrButton>
      <GrBadge :tone="phaseTone">
        {{ phaseLabel }}
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
          Terms of use
        </div>
      </template>

      <div class="grid gap-2 p-4">
        <div class="text-sm text-[var(--gr-muted-fg)]">
          With `scrollBehavior="inside"` the panel scrolls itself and the title stays put. With `outside` the whole overlay scrolls.
        </div>
        <div
          v-for="row in rows"
          :key="row"
          class="rounded-xl border border-[var(--gr-brd)] px-3 py-2 text-sm"
        >
          Clause {{ row }}
        </div>
        <GrButton class="justify-self-start" @click="open = false">
          Accept
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>
