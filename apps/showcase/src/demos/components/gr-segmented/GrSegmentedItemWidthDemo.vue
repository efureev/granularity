<script setup lang="ts">
import { ref } from 'vue'

import type { GrSegmentedItemWidth, GrSegmentedOption } from '@feugene/granularity'
import { GrSegmented } from '@feugene/granularity'

const mode = ref<GrSegmentedItemWidth>('content')
const filter = ref('all')

// Живой случай: шторка фильтра шириной 400px. При равных треках короткому слову
// достаётся лишнее место, а длинная подпись режется многоточием — притом что
// суммарно места хватает.
const filters: GrSegmentedOption[] = [
  { value: 'all', label: 'All' },
  { value: 'with', label: 'With documents' },
  { value: 'without', label: 'Without documents' },
]

// Узкая колонка на 200px: места на подписи целиком нет. Короткая остаётся
// целой, длинные делят остаток и уходят в многоточие — ряд не шире колонки.
const review = ref('mine')
const reviewFilters: GrSegmentedOption[] = [
  { value: 'all', label: 'All 6' },
  { value: 'mine', label: 'Needs my review 3' },
  { value: 'failing', label: 'Failing checks 2' },
]
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="mode"
      :options="[{ value: 'equal', label: 'equal' }, { value: 'content', label: 'content' }]"
      size="sm"
      aria-label="Item width"
    />

    <div
      data-testid="segmented-width-drawer"
      class="w-[400px] max-w-full rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] p-4"
    >
      <GrSegmented
        v-model="filter"
        :options="filters"
        :item-width="mode"
        block
        aria-label="Document filter"
      />
    </div>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      The row fills the 400px drawer either way; <code>content</code> decides who gets the slack.
    </p>

    <div
      data-testid="segmented-width-narrow"
      class="w-[200px] max-w-full rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] p-2"
    >
      <GrSegmented
        v-model="review"
        :options="reviewFilters"
        :item-width="mode"
        block
        size="sm"
        aria-label="Review filter"
      />
    </div>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      In a 200px column there is no room for every label: the short one stays whole, the long ones share the rest
      and truncate. The row never gets wider than its column.
    </p>
  </div>
</template>
