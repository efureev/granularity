<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsToaster, useToast } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push, clear } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('sticky')
const lastId = ref('')

function openStickyToast() {
  activateHost()
  clear()
  lastId.value = push({
    title: 'Manual follow-up required',
    message: 'Use timeoutMs = 0 when the toast must stay until a user action.',
    variant: 'warning',
    timeoutMs: 0,
  })
}

function clearStickyToast() {
  activateHost()
  clear()
  lastId.value = ''
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-2">
      <DsButton size="sm" variant="outline" @click="openStickyToast">
        Open sticky toast
      </DsButton>
      <DsButton size="sm" variant="ghost" @click="clearStickyToast">
        Clear store
      </DsButton>
    </div>

    <div class="text-xs text-[var(--muted-fg)]">
      Last sticky id: <span class="font-medium text-[var(--fg)]">{{ lastId || '—' }}</span>
    </div>

    <DsToaster v-if="isActiveHost" />
  </div>
</template>