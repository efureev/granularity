<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrSegmentedOption } from '@feugene/granularity'
import { GrButton, GrSegmented } from '@feugene/granularity'

const locale = ref<'ru' | 'en'>('ru')
const status = ref<'draft' | 'review' | 'published'>('review')

const localeOptions: GrSegmentedOption[] = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
]

// `syncing` — сегмент занят: спиннер вместо иконки, выбор не принимается,
// стрелки его перешагивают.
const syncing = ref(false)

const statusOptions = computed<GrSegmentedOption[]>(() => [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review', loading: syncing.value },
  { value: 'published', label: 'Published', disabled: true },
])

function syncReview() {
  syncing.value = true
  window.setTimeout(() => {
    syncing.value = false
  }, 2000)
}

const statusLabel = computed(() => statusOptions.value.find(option => option.value === status.value)?.label ?? status.value)
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
    <div class="grid gap-4 rounded-[24px] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          Language switcher
        </div>
        <GrSegmented v-model="locale" :options="localeOptions" size="sm" :indicator-duration="220" aria-label="Language" />
      </div>

      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          Block layout + disabled item
        </div>
        <GrSegmented
          v-model="status"
          :options="statusOptions"
          block
          variant="button"
          :indicator-duration="500"
          aria-label="Publishing status"
        />
      </div>
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      Selected state:
      <div class="mt-2 text-base font-semibold text-[var(--gr-fg)]">
        {{ statusLabel }}
      </div>
      <div class="mt-3 text-sm">
        The disabled option stays visible and keeps the structure of the choice set.
      </div>
      <GrButton class="mt-3" size="sm" variant="outline" :disabled="syncing" @click="syncReview">
        Sync «Review» for 2s
      </GrButton>
    </div>
  </div>
</template>
