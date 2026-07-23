<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal, useDialogService } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const dialog = useDialogService()

const open = ref(false)
const log = ref<string[]>([])

function pushLog(message: string): void {
  log.value = [message, ...log.value].slice(0, 5)
}

// confirm -> Promise<boolean>. Открытая модалка остаётся на месте: сервис
// монтирует свой host в document.body поверх неё.
async function confirmFromModal(): Promise<void> {
  const ok = await dialog.confirm(t('components.GrModal.service.confirmMessage'), {
    title: t('components.GrModal.service.confirmTitle'),
    confirmText: t('components.GrModal.service.confirmText'),
    confirmTone: 'danger',
    cancelText: t('components.GrModal.service.cancelText'),
  })
  pushLog(ok ? t('components.GrModal.service.logConfirmYes') : t('components.GrModal.service.logConfirmNo'))
}

// alert -> Promise<void>. Одна кнопка, разрешается при закрытии.
async function alertFromModal(): Promise<void> {
  await dialog.alert(t('components.GrModal.service.alertMessage'), {
    title: t('components.GrModal.service.alertTitle'),
    confirmText: t('components.GrModal.service.alertConfirm'),
  })
  pushLog(t('components.GrModal.service.logAlert'))
}

// prompt -> Promise<string | null>. Возвращает введённую строку или null.
async function promptFromModal(): Promise<void> {
  const name = await dialog.prompt(t('components.GrModal.service.promptMessage'), {
    title: t('components.GrModal.service.promptTitle'),
    label: t('components.GrModal.service.promptLabel'),
    placeholder: t('components.GrModal.service.promptPlaceholder'),
    value: t('components.GrModal.service.promptValue'),
    confirmText: t('components.GrModal.service.promptConfirm'),
    cancelText: t('components.GrModal.service.promptCancel'),
    required: true,
  })
  pushLog(name === null ? t('components.GrModal.service.logPromptCancel') : t('components.GrModal.service.logPrompt', { name }))
}
</script>

<template>
  <div class="grid gap-3">
    <p class="text-sm text-[var(--gr-muted-fg)]">
      {{ t('components.GrModal.service.intro') }}
    </p>

    <GrButton class="justify-self-start" @click="open = true">
      {{ t('components.GrModal.service.open') }}
    </GrButton>

    <GrModal v-model="open" :close-on-backdrop="false" size="md">
      <div class="grid gap-4">
        <div class="grid gap-1">
          <div class="text-sm font-semibold text-[var(--gr-fg)]">
            {{ t('components.GrModal.service.settingsTitle') }}
          </div>
          <div class="text-sm text-[var(--gr-muted-fg)]">
            {{ t('components.GrModal.service.settingsBody') }}
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
            {{ t('components.GrModal.service.resultsTitle') }}
          </div>
          <ul v-if="log.length" class="grid gap-1 text-[var(--gr-muted-fg)]">
            <li v-for="(entry, index) in log" :key="index">
              {{ entry }}
            </li>
          </ul>
          <div v-else class="text-[var(--gr-muted-fg)]">
            {{ t('components.GrModal.service.empty') }}
          </div>
        </div>

        <GrButton variant="outline" class="justify-self-start" @click="open = false">
          {{ t('components.GrModal.service.closeModal') }}
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>
