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
  const ok = await dialog.confirm('Удалить выбранный черновик безвозвратно?', {
    title: 'Удалить черновик?',
    confirmText: 'Удалить',
    confirmTone: 'danger',
    cancelText: 'Отмена',
  })
  pushLog(`confirm -> ${ok ? 'подтверждено' : 'отменено'} (модалка не закрыта)`)
}

// alert -> Promise<void>. Одна кнопка, разрешается при закрытии.
async function alertFromModal(): Promise<void> {
  await dialog.alert('Изменения сохранены в фоне. Окно настроек осталось открытым.', {
    title: 'Готово',
    confirmText: 'Понятно',
  })
  pushLog('alert -> закрыт (модалка не закрыта)')
}

// prompt -> Promise<string | null>. Возвращает введённую строку или null.
async function promptFromModal(): Promise<void> {
  const name = await dialog.prompt('Введите новое имя пресета', {
    title: 'Переименовать пресет',
    label: 'Имя пресета',
    placeholder: 'Например: Q3 pricing',
    value: 'Draft preset',
    confirmText: 'Сохранить',
    cancelText: 'Отмена',
    required: true,
  })
  pushLog(name === null ? 'prompt -> отменён' : `prompt -> "${name}"`)
}
</script>

<template>
  <div class="grid gap-3">
    <p class="text-sm text-[var(--muted-fg)]">
      Открытая <code>GrModal</code> вызывает императивный <code>useDialogService</code>.
      Сервис монтирует собственный host в <code>document.body</code> поверх модалки, поэтому
      закрытие confirm/alert/prompt <strong>не закрывает</strong> исходное окно — оно остаётся
      открытым, а решение пользователя возвращается через <code>Promise</code>.
    </p>

    <GrButton class="justify-self-start" @click="open = true">
      Open settings modal
    </GrButton>

    <GrModal v-model="open" :close-on-backdrop="false" size="md">
      <div class="grid gap-4">
        <div class="grid gap-1">
          <div class="text-sm font-semibold text-[var(--fg)]">
            Workspace settings
          </div>
          <div class="text-sm text-[var(--muted-fg)]">
            Запускайте диалоги сервиса прямо из открытого окна — оно остаётся на месте после
            закрытия любого из них.
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

        <div class="rounded-2xl border border-[var(--brd)] bg-[var(--muted)]/40 p-3 text-sm">
          <div class="mb-1 font-medium text-[var(--fg)]">
            Результаты
          </div>
          <ul v-if="log.length" class="grid gap-1 text-[var(--muted-fg)]">
            <li v-for="(entry, index) in log" :key="index">
              {{ entry }}
            </li>
          </ul>
          <div v-else class="text-[var(--muted-fg)]">
            Пока пусто — вызовите любой диалог выше.
          </div>
        </div>

        <GrButton variant="outline" class="justify-self-start" @click="open = false">
          Close modal
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>
