<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import type { ResponseErrorInfo } from '@feugene/granularity'
import IconSend from '~icons/lucide/send'
import IconTrash from '~icons/lucide/trash-2'
import IconUserMinus from '~icons/lucide/user-minus'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const deleteOpen = ref(false)
const deleteBusy = ref(false)
const deleteError = ref<ResponseErrorInfo | null>(null)
const projectDeleted = ref(false)
let deleteTimer: ReturnType<typeof setTimeout> | undefined

const lockedError: ResponseErrorInfo = {
  kind: 'client',
  status: 423,
  message: 'Не удалось удалить: проект открыт у Ивана. Попробуйте через минуту.',
  raw: null,
}

function openDelete(withError: boolean): void {
  deleteError.value = withError ? lockedError : null
  deleteOpen.value = true
}

function confirmDelete(): void {
  deleteBusy.value = true
  deleteTimer = setTimeout(() => {
    deleteBusy.value = false
    if (!deleteOpen.value)
      return
    deleteError.value = null
    deleteOpen.value = false
    projectDeleted.value = true
  }, 600)
}

onBeforeUnmount(() => clearTimeout(deleteTimer))

const publishOpen = ref(false)
const published = ref(false)

const revokeOpen = ref(false)
const revokeAcknowledged = ref(false)
const revokeMembers = ['Анна Соколова', 'Иван Петров', 'Мария Смирнова']
const revoked = ref(false)

function openRevoke(): void {
  revokeAcknowledged.value = false
  revokeOpen.value = true
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-4 py-3 text-[var(--gr-card-fg)]">
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="truncate text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">Запуск весной</span>
        <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">24 документа</span>
      </div>
      <GrButton variant="outline" tone="danger" size="sm" @click="deleteOpen = true">
        <template #prefix>
          <IconTrash />
        </template>
        Удалить проект…
      </GrButton>
    </div>
    <GrConfirmDialog
      v-model="deleteOpen"
      title="Удалить проект?"
      description="«Запуск весной» и 24 документа в нём исчезнут у всей команды. Восстановить их нельзя."
      size="sm"
      confirm-text="Удалить проект"
      cancel-text="Отмена"
      confirm-tone="danger"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Необратимое действие" note="Кнопка — тоном последствия и глаголом; фокус на «Отмене», запрос держит окно открытым, отказ сервера остаётся в окне.">
      <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-[var(--gr-card-fg)]">
        <div class="flex flex-col gap-0.5">
          <span class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">Запуск весной</span>
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ projectDeleted ? 'Проект удалён' : '24 документа · команда из шести человек' }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <GrButton variant="outline" tone="danger" :disabled="projectDeleted" @click="openDelete(false)">
            <template #prefix>
              <IconTrash />
            </template>
            Удалить проект
          </GrButton>
          <GrButton variant="ghost" tone="neutral" :disabled="projectDeleted" @click="openDelete(true)">
            Удаление с ошибкой
          </GrButton>
          <GrButton v-if="projectDeleted" variant="ghost" tone="neutral" @click="projectDeleted = false">
            Вернуть
          </GrButton>
        </div>
      </div>
      <GrConfirmDialog
        v-model="deleteOpen"
        title="Удалить проект?"
        description="«Запуск весной» и 24 документа в нём исчезнут у всей команды. Восстановить их нельзя."
        size="sm"
        :confirm-text="deleteError ? 'Повторить' : 'Удалить проект'"
        cancel-text="Отмена"
        confirm-tone="danger"
        :error="deleteError"
        :confirm-loading="deleteBusy"
        persistent
        :close-on-confirm="false"
        @confirm="confirmDelete"
      />
    </Specimen>

    <Specimen title="Рутинное подтверждение" note="Когда «да» — обычный ответ, фокус встаёт на подтверждение: Enter сразу публикует.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton :disabled="published" @click="publishOpen = true">
          <template #prefix>
            <IconSend />
          </template>
          Опубликовать статью
        </GrButton>
        <GrButton v-if="published" variant="ghost" tone="neutral" size="sm" @click="published = false">
          Снять с публикации
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ published ? 'Статья опубликована' : 'Черновик · изменён 10 минут назад' }}
      </p>
      <GrConfirmDialog
        v-model="publishOpen"
        title="Опубликовать статью?"
        description="«Как мы запускали весенний релиз» увидят все читатели блога."
        size="sm"
        confirm-text="Опубликовать"
        cancel-text="Не сейчас"
        confirm-tone="primary"
        focus-action="confirm"
        @confirm="published = true"
      />
    </Specimen>

    <Specimen title="Своё содержимое" note="Слот тела — список последствий и отметка «понимаю»; пока её нет, подтверждение выключено." wide>
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" :disabled="revoked" @click="openRevoke">
          <template #prefix>
            <IconUserMinus />
          </template>
          Отозвать доступ
        </GrButton>
        <GrButton v-if="revoked" variant="ghost" tone="neutral" size="sm" @click="revoked = false">
          Вернуть доступ
        </GrButton>
        <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ revoked ? 'Доступ отозван у трёх участников' : 'У трёх внешних участников есть доступ к проекту' }}
        </p>
      </div>
      <GrConfirmDialog
        v-model="revokeOpen"
        title="Отозвать доступ?"
        size="md"
        confirm-text="Отозвать"
        cancel-text="Отмена"
        confirm-tone="warning"
        :confirm-disabled="!revokeAcknowledged"
        @confirm="revoked = true"
      >
        <div class="flex flex-col gap-4 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
          <p>Эти участники сразу потеряют доступ к проекту «Запуск весной» и его документам:</p>
          <ul class="flex flex-wrap gap-2">
            <li v-for="member in revokeMembers" :key="member">
              <GrBadge tone="neutral">
                {{ member }}
              </GrBadge>
            </li>
          </ul>
          <GrCheckbox v-model="revokeAcknowledged">
            Понимаю, что открытые у них документы закроются
          </GrCheckbox>
        </div>
      </GrConfirmDialog>
    </Specimen>
  </div>
</template>
