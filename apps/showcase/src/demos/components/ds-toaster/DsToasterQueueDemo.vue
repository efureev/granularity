<script setup lang="ts">
import { DsButton, DsToaster, useToast } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push, clear } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('queue')

function queueWorkflowToasts() {
  activateHost()
  clear()
  push({ title: 'Sync started', message: 'Preparing records for upload.', variant: 'info' })
  push({ title: '2 warnings', message: 'Some fields will be normalized before import.', variant: 'warning', timeoutMs: 0 })
  push({ title: 'Sync finished', message: 'Records were uploaded successfully.', variant: 'success' })
}
</script>

<template>
  <div class="grid gap-3">
    <DsButton size="sm" class="justify-self-start" @click="queueWorkflowToasts">
      Queue workflow toasts
    </DsButton>

    <div class="text-xs text-[var(--muted-fg)]">
      One active `DsToaster` host is enough because `useToast` shares a global reactive store.
    </div>

    <DsToaster v-if="isActiveHost" />
  </div>
</template>