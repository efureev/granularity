import type { ShowcaseComponentExampleDoc } from '../types'

export const grConfirmDialogExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'confirm-dialog-destructive',
    title: 'Destructive confirmation',
    description: 'Главный сценарий для `GrConfirmDialog`: destructive action с кастомным текстом и semantic `confirmTone` у confirm-кнопки.',
    status: 'ready',
    previewKey: 'ds-confirm-dialog-destructive',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrConfirmDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <GrButton variant="primary" tone="danger" @click="open = true">
    Delete workspace
  </GrButton>

  <GrConfirmDialog
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

import { GrButton, GrConfirmDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <GrButton variant="outline" @click="open = true">
    Open compact confirm
  </GrButton>

  <GrConfirmDialog v-model="open" button-size="sm" cancel-text="Back" confirm-text="Promote" />
</template>`,
  },
  {
    id: 'confirm-dialog-imperative-service-link',
    title: 'Imperative service (useDialogService)',
    description: 'Императивный вызов диалогов (`confirm`/`prompt`/`alert`) из `<script>`/`.ts` без вставки компонента в шаблон вынесен на отдельную страницу composable `useDialogService` — там собраны живые примеры и обработка ошибок сервера.',
    status: 'ready',
    previewKey: 'ds-confirm-dialog-service-link',
    code: `<script setup lang="ts">
import { useDialogService } from '@feugene/granularity'

const dialog = useDialogService()

async function remove() {
  const ok = await dialog.confirm('This action cannot be undone.', {
    title: 'Delete workspace?',
    confirmText: 'Delete',
    confirmTone: 'danger',
  })
  if (ok) {
    // ... perform deletion
  }
}
</script>

<template>
  <button @click="remove">Delete</button>
</template>`,
    note: 'Полный набор императивных сценариев (confirm/prompt/alert, async-onConfirm, ошибки сети и валидации) — на странице composable useDialogService.',
  },
  {
    id: 'confirm-dialog-custom-body',
    title: 'Custom summary body',
    description: 'Подтверждаем, что в confirm-shell можно выводить richer body через default slot, а не только plain description.',
    status: 'ready',
    previewKey: 'ds-confirm-dialog-custom-body',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrConfirmDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <GrButton @click="open = true">
    Archive sprint
  </GrButton>

  <GrConfirmDialog v-model="open" title="Archive sprint" confirm-text="Archive">
    <ul class="list-disc pl-5 text-sm text-[var(--muted-fg)]">
      <li>18 tasks will move to history</li>
      <li>2 blocked items will stay pinned</li>
    </ul>
  </GrConfirmDialog>
</template>`,
  },
]
