<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDrawer, GrSegmented } from '@feugene/granularity'

const open = ref(false)
const sort = ref('recent')

const options = [
  { value: 'recent', label: 'Newest first' },
  { value: 'amount', label: 'Largest amount' },
  { value: 'status', label: 'By status' },
]
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open bottom sheet
    </GrButton>

    <!-- Сторона решает ось: `size` у нижней панели — это высота, а не ширина. -->
    <GrDrawer v-model="open" side="bottom" size="sm" title="Sort orders">
      <GrSegmented v-model="sort" :options="options" class="w-full" />

      <template #footer>
        <div class="flex justify-end">
          <GrButton @click="open = false">
            Apply
          </GrButton>
        </div>
      </template>
    </GrDrawer>
  </div>
</template>
