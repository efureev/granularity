import type { ShowcaseComponentExampleDoc } from '../types'

export const grToasterExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'toaster-builder',
    title: 'Interactive toaster constructor',
    description: 'Живой playground для ключевых пропсов `GrToaster` и payload `useToast.push`: меняйте `tone`, `placement`, `timeoutMs`, тексты и проверяйте поведение без переключения между отдельными demo-карточками.',
    status: 'ready',
    previewKey: 'gr-toaster-builder',
    code: '',
    note: 'Удобный формат для дизайн-ревью и QA: один сценарий покрывает все пропсы и shared-store контракт `useToast`.',
  },
  {
    id: 'toaster-sticky-host',
    title: 'Sticky toast and manual clear',
    description: 'Демонстрация `timeoutMs = 0` и ручного очищения shared store для уведомлений, которые не должны исчезать автоматически.',
    status: 'ready',
    previewKey: 'gr-toaster-sticky-host',
    code: `<script setup lang="ts">
import { GrButton, GrToaster, useToast } from '@feugene/granularity'

const { push, clear } = useToast()
</script>

<template>
  <GrButton size="sm" variant="outline" @click="push({ title: 'Manual follow-up required', variant: 'warning', timeoutMs: 0 })">
    Open sticky toast
  </GrButton>
  <GrButton size="sm" variant="ghost" @click="clear()">
    Clear store
  </GrButton>

  <GrToaster />
</template>`,
  },
  {
    id: 'toaster-queue-flow',
    title: 'Queued workflow feedback',
    description: 'Отдельный workflow-сценарий: пушим несколько toast подряд, чтобы проверить stacking и ручные sticky warnings.',
    status: 'ready',
    previewKey: 'gr-toaster-queue-flow',
    code: `<script setup lang="ts">
import { GrButton, GrToaster, useToast } from '@feugene/granularity'

const { push } = useToast()

function queueWorkflowToasts() {
  push({ title: 'Sync started', variant: 'info' })
  push({ title: '2 warnings', variant: 'warning', timeoutMs: 0 })
  push({ title: 'Sync finished', variant: 'success' })
}
</script>

<template>
  <GrButton size="sm" @click="queueWorkflowToasts">
    Queue workflow toasts
  </GrButton>

  <GrToaster />
</template>`,
  },
  {
    id: 'toaster-action',
    title: 'Action buttons: size, variant, multiple',
    description: 'Payload `useToast.push` принимает `action: { label, onClick }` для одной кнопки или `actions: [...]` для нескольких. У каждой кнопки настраиваются `size` и `variant`; `dismissOnClick: false` оставляет тост открытым (например, «Retry» для sticky-ошибки).',
    status: 'ready',
    previewKey: 'gr-toaster-action',
    code: `<script setup lang="ts">
import { GrButton, GrToaster, useToast } from '@feugene/granularity'

const { push } = useToast()

function archiveWithUndo() {
  push({
    title: 'Message archived',
    message: 'Moved to archive. You can still undo this.',
    tone: 'info',
    timeoutMs: 6000,
    // Несколько кнопок с разными variant/size.
    actions: [
      { label: 'Undo', variant: 'primary', size: 'sm', onClick: () => restoreMessage() },
      { label: 'View archive', variant: 'ghost', size: 'sm', dismissOnClick: false, onClick: () => openArchive() },
    ],
  })
}

function failedUpload() {
  push({
    title: 'Upload failed',
    tone: 'danger',
    timeoutMs: 0,
    action: {
      label: 'Retry',
      size: 'md', // более крупная кнопка для основного действия
      dismissOnClick: false, // держим тост открытым во время повтора
      onClick: () => retryUpload(),
    },
  })
}
</script>

<template>
  <GrButton size="sm" @click="archiveWithUndo">Archive with Undo</GrButton>
  <GrButton size="sm" variant="outline" @click="failedUpload">Failed upload (Retry)</GrButton>

  <GrToaster />
</template>`,
    note: '`action.onClick` вызывается синхронно перед закрытием — удобно для undo/retry-паттернов, где важно успеть отменить операцию.',
  },
  {
    id: 'toaster-action-slot',
    title: 'Custom action buttons via slot',
    description: 'Слот `#actions` полностью заменяет дефолтные кнопки: он получает сам `toast` и функцию `dismiss`, которая закрывает именно этот тост. Так можно рендерить любые контролы и самому решать, когда закрывать уведомление.',
    status: 'ready',
    previewKey: 'gr-toaster-action-slot',
    code: `<script setup lang="ts">
import { GrButton, GrToaster, useToast } from '@feugene/granularity'

const { push } = useToast()

function notify() {
  push({
    title: 'Deploy ready',
    message: 'Review the build and promote it to production.',
    tone: 'success',
    timeoutMs: 0,
  })
}
</script>

<template>
  <GrButton size="sm" @click="notify">Notify with custom actions</GrButton>

  <GrToaster>
    <!-- Кнопки действий через слот; \`dismiss\` закрывает этот тост. -->
    <template #actions="{ toast, dismiss }">
      <GrButton size="sm" variant="primary" @click="() => { promote(toast); dismiss() }">
        Promote
      </GrButton>
      <GrButton size="sm" variant="ghost" @click="dismiss">
        Later
      </GrButton>
    </template>
  </GrToaster>
</template>`,
    note: 'Слот задаётся один раз на `GrToaster` и применяется ко всем тостам; внутри доступен `toast` (title/message/tone/…) и `dismiss()`.',
  },
]
