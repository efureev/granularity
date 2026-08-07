<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrToaster, useToast } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push, promise, clear } = useToast()
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
    // Массив кнопок с разными variant/size.
    actions: [
      {
        label: 'Undo',
        variant: 'primary',
        size: 'sm',
        onClick: () => {
          archived.value = false
          lastAction.value = 'Undo — message restored'
        },
      },
      {
        label: 'View archive',
        variant: 'ghost',
        size: 'sm',
        dismissOnClick: false,
        onClick: () => {
          lastAction.value = 'Opened archive'
        },
      },
    ],
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
      // Более крупная кнопка для основного sticky-действия.
      size: 'md',
      variant: 'outline',
      // dismissOnClick: false — оставляем тост открытым, чтобы показать «повтор».
      dismissOnClick: false,
      onClick: () => {
        lastAction.value = 'Retrying upload…'
      },
    },
  })
}

// Один тост на весь жизненный цикл запроса: «загружаем» переписывается в
// результат, а не закрывается ради нового.
function notifyWithPromise(shouldFail: boolean) {
  activateHost()
  clear()
  lastAction.value = 'Syncing…'

  const request = new Promise<{ files: number }>((resolve, reject) => {
    setTimeout(() => (shouldFail ? reject(new Error('Gateway timeout')) : resolve({ files: 12 })), 1500)
  })

  promise(request, {
    loading: { title: 'Syncing workspace', message: 'Uploading local changes…' },
    success: result => ({ title: 'Workspace synced', message: `${result.files} files uploaded` }),
    error: reason => ({ title: 'Sync failed', message: (reason as Error).message }),
  })
    .then(() => { lastAction.value = 'Sync finished' })
    .catch(() => { lastAction.value = 'Sync failed' })
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
      <GrButton size="sm" variant="outline" @click="notifyWithPromise(false)">
        Sync (promise)
      </GrButton>
      <GrButton size="sm" variant="outline" @click="notifyWithPromise(true)">
        Sync that fails
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
