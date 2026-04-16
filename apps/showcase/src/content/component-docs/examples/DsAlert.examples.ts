import type { ShowcaseComponentExampleDoc } from '../types'

export const dsAlertExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'alert-tone-matrix',
    title: 'Semantic tones for inline feedback',
    description: 'Базовая матрица фиксирует ключевые alert-tone состояния, чтобы на странице компонента сразу был виден визуальный диапазон `info/success/warning/danger/slate/azure`.',
    status: 'ready',
    previewKey: 'ds-alert-variant-matrix',
    code: `<script setup lang="ts">
import { DsAlert } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3">
    <DsAlert title="Info" tone="info">Deploy preview URL is ready for the QA handoff.</DsAlert>
    <DsAlert title="Success" tone="success">Billing sync finished and no manual retries are required.</DsAlert>
    <DsAlert title="Warning" tone="warning">API quota is at 78%; consider moving heavy jobs to the night window.</DsAlert>
    <DsAlert title="Danger" tone="danger">Background worker lost connection to Redis and needs operator attention.</DsAlert>
    <DsAlert title="Slate" tone="slate">Runbook is archived and kept for passive operator context.</DsAlert>
    <DsAlert title="Azure" tone="azure">Release note references are ready for stakeholder review.</DsAlert>
  </div>
</template>`,
  },
  {
    id: 'alert-closable-flow',
    title: 'Closable alert with host-level state',
    description: 'Отдельно показываем, что `DsAlert` не скрывается сам по себе: родительский экран получает `close` и сам решает, когда вернуть banner обратно.',
    status: 'ready',
    previewKey: 'ds-alert-closable-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsAlert, DsButton } from '@feugene/granularity'

const visible = ref(true)
</script>

<template>
  <DsAlert
    v-if="visible"
    title="Maintenance window"
    tone="warning"
    variant="light"
    closable
    @close="visible = false"
  >
    Payments will be processed in read-only mode from 02:00 to 02:30 UTC.
  </DsAlert>

  <DsButton v-else size="sm" variant="outline" @click="visible = true">
    Restore alert
  </DsButton>
</template>`,
  },
  {
    id: 'alert-custom-colors',
    title: 'Brand-specific colors without layout overrides',
    description: 'Сценарий нужен для dashboard-команд, которым важно подстроить alert под доменный бренд, но сохранить icon/layout API компонента.',
    status: 'ready',
    previewKey: 'ds-alert-custom-colors',
    code: `<script setup lang="ts">
import { DsAlert } from '@feugene/granularity'
</script>

<template>
  <DsAlert
    title="Custom brand banner"
    background-color="#ecfeff"
    border-color="#22d3ee"
    text-color="#155e75"
  >
    Teams often override colors to align alerts with domain-specific dashboards or tenant branding.
  </DsAlert>
</template>`,
  },
]
