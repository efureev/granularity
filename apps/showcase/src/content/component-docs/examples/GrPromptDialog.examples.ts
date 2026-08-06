import type { ShowcaseComponentExampleDoc } from '../types'

export const grPromptDialogExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'prompt-dialog-rename-flow',
    title: 'Rename flow with required value',
    description: 'Базовый сценарий для `GrPromptDialog`: controlled value, required validation и сохранение подтверждённого текста.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-rename-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPromptDialog } from '@feugene/granularity'

const open = ref(false)
const value = ref('Q2 North Star')
</script>

<template>
  <GrButton @click="open = true">
    Rename objective
  </GrButton>

  <GrPromptDialog v-model="open" v-model:value="value" title="Rename objective" label="Objective title" confirm-text="Save" />
</template>`,
  },
  {
    id: 'prompt-dialog-optional-value',
    title: 'Optional input mode',
    description: 'Показываем `required=false`, placeholder и compact footer для необязательных handoff notes.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-optional-value',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPromptDialog } from '@feugene/granularity'

const open = ref(false)
const note = ref('Call finance before noon')
</script>

<template>
  <GrButton variant="outline" @click="open = true">
    Open optional prompt
  </GrButton>

  <GrPromptDialog v-model="open" v-model:value="note" :required="false" confirm-text="Attach" button-size="sm" />
</template>`,
  },
  {
    id: 'prompt-dialog-reset-flow',
    title: 'External source-of-truth reset',
    description: 'Изолируем кейс, когда значение приходит из внешнего store и должно сбрасываться на момент повторного открытия.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-reset-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPromptDialog } from '@feugene/granularity'

const open = ref(false)
const value = ref('Acme Corp')
</script>

<template>
  <GrButton @click="open = true">
    Edit billing company
  </GrButton>

  <GrPromptDialog v-model="open" v-model:value="value" title="Billing company" confirm-text="Update" cancel-text="Keep current" />
</template>`,
  },
  {
    id: 'prompt-dialog-imperative-service-link',
    title: 'Imperative service (useDialogService)',
    description: 'Нужен `prompt` без декларативного компонента в шаблоне? Императивный `useDialogService().prompt()` возвращает `Promise<string | null>` и собран с живыми примерами на отдельной странице composable.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-service-link',
    code: `<script setup lang="ts">
import { useDialogService } from '@feugene/granularity'

const dialog = useDialogService()

async function rename() {
  const name = await dialog.prompt('Pick a new project name.', {
    title: 'Rename project',
    label: 'Project name',
    required: true,
    confirmText: 'Save',
  })
  if (name !== null) {
    // ... persist the new name
  }
}
</script>

<template>
  <button @click="rename">Rename</button>
</template>`,
    note: 'Императивный prompt и остальные методы (confirm/alert) описаны на странице composable useDialogService.',
  },
  {
    id: 'prompt-dialog-multiline-rules',
    title: 'Multiline input with shared validation rules',
    description: '`multiline` даёт `GrTextarea` вместо однострочного поля, а `rules` — те же правила, что у `GrForm`: движок валидации в пакете один, а не отдельный у каждого компонента.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-multiline-rules',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import type { GrFormRule } from '@feugene/granularity'
import { GrBadge, GrButton, GrPromptDialog } from '@feugene/granularity'

const open = ref(false)
const reason = ref('')
const lastSubmitted = ref('')

// Те же правила, что и у \`GrForm\`: движок один на пакет.
const rules: GrFormRule[] = [
  { min: 15, message: 'Опишите причину подробнее — минимум 15 символов' },
  {
    validator: (value) => {
      const text = String(value).trim().toLowerCase()
      return text === 'нет' || text === 'не хочу'
        ? 'Такая причина не пройдёт проверку у согласующего'
        : true
    },
  },
]
</script>

<template>
  <div class="grid gap-3">
    <GrButton variant="outline" class="justify-self-start" @click="open = true">
      Отклонить заявку
    </GrButton>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Последняя причина:
      <GrBadge class="ml-1">
        {{ lastSubmitted || '—' }}
      </GrBadge>
    </div>

    <GrPromptDialog
      v-model="open"
      v-model:value="reason"
      title="Причина отказа"
      label="Причина"
      placeholder="Что именно не так с заявкой"
      confirm-text="Отклонить"
      confirm-tone="danger"
      multiline
      :rows="4"
      autosize
      :maxlength="300"
      show-count
      :rules="rules"
      @confirm="lastSubmitted = $event"
    />
  </div>
</template>`,
  },
]
