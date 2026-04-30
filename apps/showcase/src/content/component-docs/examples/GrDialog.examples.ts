import type { ShowcaseComponentExampleDoc } from '../types'

export const grDialogExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dialog-basic-flow',
    title: 'Basic dialog shell',
    description: 'Показываем базовый слой над `GrModal`: готовый header/footer shell для review, approval и confirm-like сценариев.',
    status: 'ready',
    previewKey: 'ds-dialog-basic-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <GrButton @click="open = true">
    Open review dialog
  </GrButton>

  <GrDialog v-model="open" title="Publish weekly digest" size="sm">
    <div class="text-sm text-[var(--muted-fg)]">
      <code>GrDialog</code> already provides consistent header, close action and footer slot.
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <GrButton variant="outline" @click="open = false">Cancel</GrButton>
        <GrButton @click="open = false">Publish</GrButton>
      </div>
    </template>
  </GrDialog>
</template>`,
  },
  {
    id: 'dialog-section-config',
    title: 'Section config and internal state',
    description: 'Демонстрируем `headerConfig` / `footerConfig` и локальное состояние формы внутри dialog-shell.',
    status: 'ready',
    previewKey: 'ds-dialog-section-config',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDialog } from '@feugene/granularity'

const open = ref(false)
const confirmed = ref(false)
</script>

<template>
  <GrButton variant="outline" @click="open = true">
    Open stateful dialog
  </GrButton>

  <GrDialog
    v-model="open"
    title="Share workspace"
    :header-config="{ paddingX: 'px-4', paddingY: 'py-3' }"
    :footer-config="{ paddingX: 'px-4', paddingY: 'py-3', bordered: false }"
  >
    <label class="flex gap-3 text-sm">
      <input v-model="confirmed" type="checkbox" />
      <span>I reviewed access levels.</span>
    </label>

    <template #footer>
      <GrButton :disabled="!confirmed">Share workspace</GrButton>
    </template>
  </GrDialog>
</template>`,
  },
  {
    id: 'dialog-guarded-backdrop',
    title: 'Guarded backdrop for critical flows',
    description: 'Отдельный сценарий для `closeOnBackdrop=false`, когда закрытие должно происходить только по явным действиям.',
    status: 'ready',
    previewKey: 'ds-dialog-guarded-backdrop',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDialog } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <GrButton @click="open = true">
    Open guarded dialog
  </GrButton>

  <GrDialog v-model="open" title="Resolve blockers" :close-on-backdrop="false" :show-close-button="false">
    <div class="text-sm text-[var(--muted-fg)]">
      Backdrop clicks are ignored until the user explicitly chooses an action.
    </div>
  </GrDialog>
</template>`,
    note: 'Сценарий полезен для финальных шагов publish/delete/release flows.',
  },
]
