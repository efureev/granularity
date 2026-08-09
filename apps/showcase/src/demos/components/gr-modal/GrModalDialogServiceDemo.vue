<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal, useDialogService } from '@feugene/granularity'

const dialog = useDialogService()

const open = ref(false)
const log = ref<string[]>([])

function pushLog(message: string): void {
  log.value = [message, ...log.value].slice(0, 5)
}

// confirm -> Promise<boolean>. Открытая модалка остаётся на месте: сервис
// монтирует свой host в document.body поверх неё.
async function confirmFromModal(): Promise<void> {
  const ok = await dialog.confirm('Delete the selected draft irreversibly?', {
    title: 'Delete draft?',
    confirmText: 'Delete',
    confirmTone: 'danger',
    cancelText: 'Cancel',
  })
  pushLog(ok ? 'confirm -> confirmed (modal not closed)' : 'confirm -> cancelled (modal not closed)')
}

// alert -> Promise<void>. Одна кнопка, разрешается при закрытии.
async function alertFromModal(): Promise<void> {
  await dialog.alert('Changes were saved in the background. The settings window stayed open.', {
    title: 'Done',
    confirmText: 'Got it',
  })
  pushLog('alert -> closed (modal not closed)')
}

// prompt -> Promise<string | null>. Возвращает введённую строку или null.
async function promptFromModal(): Promise<void> {
  const name = await dialog.prompt('Enter a new preset name', {
    title: 'Rename preset',
    label: 'Preset name',
    placeholder: 'For example: Q3 pricing',
    value: 'Draft preset',
    confirmText: 'Save',
    cancelText: 'Cancel',
    required: true,
  })
  pushLog(name === null ? 'prompt -> cancelled' : `prompt -> "${name}"`)
}
</script>

<template>
  <div class="grid gap-3">
    <p class="text-sm text-[var(--gr-muted-fg)]">
      An open `GrModal` invokes the imperative `useDialogService`. The service mounts its own host in `document.body` on top of the modal, so closing confirm/alert/prompt does not close the source window — it stays open, and the user's decision is returned through a `Promise`.
    </p>

    <GrButton class="justify-self-start" @click="open = true">
      Open settings modal
    </GrButton>

    <GrModal
      v-model="open"
      :close-on-backdrop="false"
      size="md"
      aria-label="Workspace settings"
    >
      <div class="grid gap-4">
        <div class="grid gap-1">
          <div class="text-sm font-semibold text-[var(--gr-fg)]">
            Workspace settings
          </div>
          <div class="text-sm text-[var(--gr-muted-fg)]">
            Launch service dialogs straight from the open window — it stays in place after any of them is closed.
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <GrButton variant="primary" tone="danger" @click="confirmFromModal">
            confirm
          </GrButton>
          <GrButton variant="outline" @click="alertFromModal">
            alert
          </GrButton>
          <GrButton variant="outline" @click="promptFromModal">
            prompt
          </GrButton>
        </div>

        <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-muted)]/40 p-3 text-sm">
          <div class="mb-1 font-medium text-[var(--gr-fg)]">
            Results
          </div>
          <ul v-if="log.length" class="grid gap-1 text-[var(--gr-muted-fg)]">
            <li v-for="(entry, index) in log" :key="index">
              {{ entry }}
            </li>
          </ul>
          <div v-else class="text-[var(--gr-muted-fg)]">
            Empty for now — invoke any dialog above.
          </div>
        </div>

        <GrButton variant="outline" class="justify-self-start" @click="open = false">
          Close modal
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>
