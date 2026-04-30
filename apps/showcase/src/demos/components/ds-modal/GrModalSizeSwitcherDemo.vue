<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal } from '@feugene/granularity'

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
        Compact review
      </GrButton>
      <GrButton @click="openWithSize('lg')">
        Wide review
      </GrButton>
    </div>

    <GrModal v-model="open" :size="activeSize">
      <div class="grid gap-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-[var(--fg)]">
              Active size: {{ activeSize }}
            </div>
            <div class="text-sm text-[var(--muted-fg)]">
              Один и тот же flow может масштабироваться под review, preview или multi-column payload.
            </div>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl border border-[var(--brd)] p-3 text-sm">
            Summary block
          </div>
          <div class="rounded-2xl border border-[var(--brd)] p-3 text-sm">
            Secondary block
          </div>
        </div>

        <GrButton class="justify-self-start" @click="open = false">
          Done
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>