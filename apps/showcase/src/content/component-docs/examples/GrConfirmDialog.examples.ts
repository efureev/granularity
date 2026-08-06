import type { ShowcaseComponentExampleDoc } from '../types'

export const grConfirmDialogExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'confirm-dialog-destructive',
    title: 'Destructive confirmation',
    description: 'Главный сценарий для `GrConfirmDialog`: destructive action с кастомным текстом и semantic `confirmTone` у confirm-кнопки.',
    status: 'ready',
    previewKey: 'gr-confirm-dialog-destructive',
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
    previewKey: 'gr-confirm-dialog-button-matrix',
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
    previewKey: 'gr-confirm-dialog-service-link',
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
    previewKey: 'gr-confirm-dialog-custom-body',
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
    <ul class="list-disc pl-5 text-sm text-[var(--gr-muted-fg)]">
      <li>18 tasks will move to history</li>
      <li>2 blocked items will stay pinned</li>
    </ul>
  </GrConfirmDialog>
</template>`,
  },
  {
    id: 'confirm-dialog-async-confirm',
    title: 'Async confirmation with server error',
    description: '`closeOnConfirm: false` отдаёт закрытие наружу, `confirmLoading` держит кнопку, `persistent` снимает Esc и бэкдроп на время операции, а `error` рисует ответ сервера, не закрывая окно. `focusAction` выбирает, какое действие получает фокус при открытии.',
    status: 'ready',
    previewKey: 'gr-confirm-dialog-async-confirm',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import type { ResponseErrorInfo } from '@feugene/granularity'
import { GrBadge, GrButton, GrConfirmDialog, GrSegmented } from '@feugene/granularity'

const open = ref(false)
const loading = ref(false)
const error = ref<ResponseErrorInfo | null>(null)
const status = ref('Ничего не отправляли')

// Первая попытка отвечает отказом, вторая проходит — так видно и баннер, и то,
// что окно остаётся открытым для повтора.
let attempt = 0

const focusAction = ref<'cancel' | 'confirm'>('cancel')

function openDialog() {
  attempt = 0
  error.value = null
  status.value = 'Ничего не отправляли'
  open.value = true
}

async function onConfirm() {
  attempt += 1
  loading.value = true
  error.value = null

  await new Promise(resolve => setTimeout(resolve, 1500))
  loading.value = false

  if (attempt === 1) {
    error.value = { kind: 'unknown', message: 'Сервер отклонил запрос. Попробуйте ещё раз.', raw: null }
    return
  }

  status.value = 'Рабочая область удалена'
  open.value = false
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrSegmented
        v-model="focusAction"
        size="sm"
        :options="[
          { value: 'cancel', label: 'focusAction: cancel' },
          { value: 'confirm', label: 'focusAction: confirm' },
        ]"
      />
      <GrButton variant="primary" tone="danger" @click="openDialog">
        Удалить рабочую область
      </GrButton>
      <GrBadge size="sm" :tone="status.startsWith('Рабочая') ? 'danger' : 'neutral'">
        {{ status }}
      </GrBadge>
    </div>

    <GrConfirmDialog
      v-model="open"
      title="Удалить рабочую область?"
      description="Первая попытка вернёт ошибку сервера — окно останется открытым для повтора."
      confirm-text="Удалить"
      confirm-tone="danger"
      :focus-action="focusAction"
      :confirm-loading="loading"
      :error="error"
      :close-on-confirm="false"
      persistent
      @confirm="onConfirm"
    />
  </div>
</template>`,
  },
]
