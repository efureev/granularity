<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

// Узкая колонка на 190px: чипы переносятся, а поле растёт вместе с рядами —
// рамка и кольцо фокуса вокруг всех чипов, а не только первого ряда.
const labelOptions = [
  { value: 'bug', label: 'Bug' },
  { value: 'billing', label: 'Billing' },
  { value: 'customer', label: 'Customer report' },
  { value: 'regression', label: 'Regression' },
  { value: 'docs', label: 'Docs' },
]

const md = ref(['bug', 'billing', 'customer', 'regression'])
const sm = ref(['bug', 'billing', 'customer'])
const xs = ref(['bug', 'billing', 'customer'])
</script>

<template>
  <div data-demo="select-tags-wrap" class="grid gap-4 sm:grid-cols-3">
    <div class="w-[190px] max-w-full">
      <GrSelect
        v-model="md"
        :options="labelOptions"
        options-view="panel"
        multiple
        tags
        :max-tag-count="3"
        :close-on-select="false"
        aria-label="Labels, md"
      />
    </div>
    <div class="w-[190px] max-w-full">
      <GrSelect
        v-model="sm"
        :options="labelOptions"
        options-view="panel"
        multiple
        tags
        size="sm"
        shape="pill"
        aria-label="Labels, sm pill"
      />
    </div>
    <div class="w-[190px] max-w-full">
      <GrSelect
        v-model="xs"
        :options="labelOptions"
        options-view="panel"
        multiple
        tags
        size="xs"
        clearable
        aria-label="Labels, xs"
      />
    </div>
  </div>
</template>
