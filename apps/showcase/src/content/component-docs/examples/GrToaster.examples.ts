import type { ShowcaseComponentExampleDoc } from '../types'

export const grToasterExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'toaster-builder',
    title: 'Interactive toaster constructor',
    description: 'Живой playground для ключевых пропсов `GrToaster` и payload `useToast.push`: меняйте `tone`, `placement`, `timeoutMs`, тексты и проверяйте поведение без переключения между отдельными demo-карточками.',
    status: 'ready',
    previewKey: 'ds-toaster-builder',
    code: '',
    note: 'Удобный формат для дизайн-ревью и QA: один сценарий покрывает все пропсы и shared-store контракт `useToast`.',
  },
  {
    id: 'toaster-sticky-host',
    title: 'Sticky toast and manual clear',
    description: 'Демонстрация `timeoutMs = 0` и ручного очищения shared store для уведомлений, которые не должны исчезать автоматически.',
    status: 'ready',
    previewKey: 'ds-toaster-sticky-host',
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
    previewKey: 'ds-toaster-queue-flow',
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
]
