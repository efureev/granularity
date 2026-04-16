<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsModal } from '@feugene/granularity'

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
      <DsButton variant="outline" @click="openWithSize('sm')">
        Compact review
      </DsButton>
      <DsButton @click="openWithSize('lg')">
        Wide review
      </DsButton>
    </div>

    <DsModal v-model="open" :size="activeSize">
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

        <DsButton class="justify-self-start" @click="open = false">
          Done
        </DsButton>
      </div>
    </DsModal>
  </div>
</template>