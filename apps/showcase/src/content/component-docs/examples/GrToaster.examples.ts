import type { ShowcaseComponentExampleDoc } from '../types'

export const grToasterExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'toaster-tone-push',
    title: 'Variant push buttons',
    description: 'Показываем базовый `push` с разными `tone` и сразу фиксируем, что toast store общий для приложения.',
    status: 'ready',
    previewKey: 'ds-toaster-variant-push',
    code: `<script setup lang="ts">
import { GrButton, GrToaster, useToast } from '@feugene/granularity'

const { push } = useToast()
</script>

<template>
  <GrButton size="sm" @click="push({ title: 'Saved', variant: 'success' })">
    Push success toast
  </GrButton>

  <GrToaster />
</template>`,
    note: 'В showcase preview используется singleton-host pattern, чтобы несколько demo-карточек не рендерили один и тот же shared toast stack одновременно.',
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
