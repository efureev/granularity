<script setup lang="ts">
import { DsButton, DsToaster, useToast } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push, clear } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('variants')

function notify(variant: 'info' | 'success' | 'warning' | 'danger') {
  activateHost()
  clear()
  push({
    variant,
    title: `${variant[0].toUpperCase()}${variant.slice(1)} toast`,
    message: 'Shared toast store is now rendered through the active showcase host.',
  })
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-2">
      <DsButton size="sm" variant="outline" @click="notify('info')">
        Info
      </DsButton>
      <DsButton size="sm" variant="primary" @click="notify('success')">
        Primary
      </DsButton>
      <DsButton size="sm" variant="primary" tone="warning" @click="notify('warning')">
        Warning
      </DsButton>
      <DsButton size="sm" variant="primary" tone="danger" @click="notify('danger')">
        Danger
      </DsButton>
    </div>

    <div class="text-xs text-[var(--muted-fg)]">
      Active host: <span class="font-medium text-[var(--fg)]">{{ isActiveHost ? 'this preview' : 'another preview' }}</span>
    </div>

    <DsToaster v-if="isActiveHost" />
  </div>
</template>