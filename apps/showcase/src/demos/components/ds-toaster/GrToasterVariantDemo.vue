<script setup lang="ts">
import { GrButton, GrToaster, useToast } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push, clear } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('variants')

function notify(tone: 'info' | 'success' | 'warning' | 'danger') {
  activateHost()
  clear()
  push({
    tone,
    title: `${tone[0].toUpperCase()}${tone.slice(1)} toast`,
    message: 'Shared toast store is now rendered through the active showcase host.',
  })
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" variant="outline" @click="notify('info')">
        Info
      </GrButton>
      <GrButton size="sm" variant="primary" @click="notify('success')">
        Primary
      </GrButton>
      <GrButton size="sm" variant="primary" tone="warning" @click="notify('warning')">
        Warning
      </GrButton>
      <GrButton size="sm" variant="primary" tone="danger" @click="notify('danger')">
        Danger
      </GrButton>
    </div>

    <div class="text-xs text-[var(--muted-fg)]">
      Active host: <span class="font-medium text-[var(--fg)]">{{ isActiveHost ? 'this preview' : 'another preview' }}</span>
    </div>

    <GrToaster v-if="isActiveHost" />
  </div>
</template>