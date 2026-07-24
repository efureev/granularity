<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrToaster, useToast } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push, clear } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('action')

// Отслеживаем, что действие реально выполнилось (для наглядности демо).
const lastAction = ref('—')
const archived = ref(false)

function notifyWithUndo() {
  activateHost()
  clear()
  archived.value = true
  lastAction.value = 'Message archived'

  push({
    title: 'Message archived',
    message: 'Moved to archive. You can still undo this.',
    tone: 'info',
    timeoutMs: 6000,
    action: {
      label: 'Undo',
      onClick: () => {
        archived.value = false
        lastAction.value = 'Undo — message restored'
      },
    },
  })
}

function notifyWithRetry() {
  activateHost()
  clear()
  lastAction.value = 'Upload failed'

  push({
    title: 'Upload failed',
    message: 'Network error while uploading report.pdf.',
    tone: 'danger',
    // Sticky: держим тост, пока пользователь не отреагирует на action.
    timeoutMs: 0,
    action: {
      label: 'Retry',
      // dismissOnClick: false — оставляем тост открытым, чтобы показать «повтор».
      dismissOnClick: false,
      onClick: () => {
        lastAction.value = 'Retrying upload…'
      },
    },
  })
}

function clearStore() {
  activateHost()
  clear()
  lastAction.value = '—'
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" @click="notifyWithUndo">
        Archive with Undo
      </GrButton>
      <GrButton size="sm" variant="outline" @click="notifyWithRetry">
        Failed upload (Retry)
      </GrButton>
      <GrButton size="sm" variant="ghost" @click="clearStore">
        Clear store
      </GrButton>
    </div>

    <div class="flex flex-wrap items-center gap-2 text-xs">
      <GrBadge :tone="archived ? 'warning' : 'success'">
        {{ archived ? 'Archived' : 'In inbox' }}
      </GrBadge>
      <span class="text-[var(--gr-muted-fg)]">
        Last action: <span class="font-medium text-[var(--gr-fg)]">{{ lastAction }}</span>
      </span>
    </div>

    <GrToaster v-if="isActiveHost" />
  </div>
</template>
