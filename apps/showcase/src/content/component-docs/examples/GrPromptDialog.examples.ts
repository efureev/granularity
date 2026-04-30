import type { ShowcaseComponentExampleDoc } from '../types'

export const grPromptDialogExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'prompt-dialog-rename-flow',
    title: 'Rename flow with required value',
    description: 'Базовый сценарий для `GrPromptDialog`: controlled value, required validation и сохранение подтверждённого текста.',
    status: 'ready',
    previewKey: 'ds-prompt-dialog-rename-flow',
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
    previewKey: 'ds-prompt-dialog-optional-value',
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
    previewKey: 'ds-prompt-dialog-reset-flow',
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
]
