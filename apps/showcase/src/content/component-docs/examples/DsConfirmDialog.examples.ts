import type { ShowcaseComponentExampleDoc } from '../types'

export const dsConfirmDialogExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'confirm-dialog-destructive',
    title: 'Destructive confirmation',
    description: 'Главный сценарий для `DsConfirmDialog`: destructive action с кастомным текстом и semantic `confirmTone` у confirm-кнопки.',
    status: 'ready',
    previewKey: 'ds-confirm-dialog-destructive',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsConfirmDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <DsButton variant="primary" tone="danger" @click="open = true">
    Delete workspace
  </DsButton>

  <DsConfirmDialog
    v-model="open"
    title="Delete workspace?"
    description="This action revokes links and automations."
    confirm-text="Delete"
    confirm-tone="danger"
  />
</template>`,
  },
  {
    id: 'confirm-dialog-button-matrix',
    title: 'Compact action sizes',
    description: 'Отдельно проверяем `buttonSize`, `cancelText` и плотные approval flows.',
    status: 'ready',
    previewKey: 'ds-confirm-dialog-button-matrix',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsConfirmDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <DsButton variant="outline" @click="open = true">
    Open compact confirm
  </DsButton>

  <DsConfirmDialog v-model="open" button-size="sm" cancel-text="Back" confirm-text="Promote" />
</template>`,
  },
  {
    id: 'confirm-dialog-custom-body',
    title: 'Custom summary body',
    description: 'Подтверждаем, что в confirm-shell можно выводить richer body через default slot, а не только plain description.',
    status: 'ready',
    previewKey: 'ds-confirm-dialog-custom-body',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsConfirmDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <DsButton @click="open = true">
    Archive sprint
  </DsButton>

  <DsConfirmDialog v-model="open" title="Archive sprint" confirm-text="Archive">
    <ul class="list-disc pl-5 text-sm text-[var(--muted-fg)]">
      <li>18 tasks will move to history</li>
      <li>2 blocked items will stay pinned</li>
    </ul>
  </DsConfirmDialog>
</template>`,
  },
]
