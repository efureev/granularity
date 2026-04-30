<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrSegmentedOption } from '@feugene/granularity'
import { GrSegmented } from '@feugene/granularity'

const locale = ref<'ru' | 'en'>('ru')
const status = ref<'draft' | 'review' | 'published'>('review')

const localeOptions: GrSegmentedOption[] = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
]

const statusOptions: GrSegmentedOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'published', label: 'Published', disabled: true },
]

const statusLabel = computed(() => statusOptions.find(option => option.value === status.value)?.label ?? status.value)
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
    <div class="grid gap-4 rounded-[24px] border border-[var(--brd)] bg-[var(--card)] p-5">
      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--fg)]">
          Language switcher
        </div>
        <GrSegmented v-model="locale" :options="localeOptions" size="sm" :indicator-duration="220" aria-label="Language" />
      </div>

      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--fg)]">
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

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      Selected state:
      <div class="mt-2 text-base font-semibold text-[var(--fg)]">
        {{ statusLabel }}
      </div>
      <div class="mt-3 text-sm">
        Disabled option остаётся видимой и сохраняет структуру choice set.
      </div>
    </div>
  </div>
</template>