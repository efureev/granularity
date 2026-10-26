<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import type { GrFormRule } from '@feugene/granularity'
import IconBan from '~icons/lucide/ban'
import IconGitCommit from '~icons/lucide/git-commit-horizontal'
import IconLock from '~icons/lucide/lock'
import IconPencil from '~icons/lucide/pencil'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const renameOpen = ref(false)
const documentTitle = ref('Отчёт за квартал')
const renameDraft = ref('')

function openRename(): void {
  renameDraft.value = documentTitle.value
  renameOpen.value = true
}

function applyRename(value: string): void {
  documentTitle.value = value.trim()
}

const rejectOpen = ref(false)
const rejectReason = ref('')
const lastReason = ref('')
const rejectRules: GrFormRule[] = [
  { min: 15, message: 'Опишите подробнее — хотя бы 15 символов' },
  {
    validator: (value) => {
      const text = String(value).trim().toLowerCase()
      return text === 'не подходит' || text === 'плохо'
        ? 'Такую причину не примет согласующий — напишите, что исправить'
        : true
    },
  },
]

function openReject(): void {
  rejectReason.value = ''
  rejectOpen.value = true
}

const passwordOpen = ref(false)
const password = ref('')
const passwordBusy = ref(false)
const passwordError = ref<string | null>(null)
const tokensRevoked = ref(false)
let passwordTimer: ReturnType<typeof setTimeout> | undefined

function openPassword(): void {
  password.value = ''
  passwordError.value = null
  passwordOpen.value = true
}

function checkPassword(value: string): void {
  passwordBusy.value = true
  passwordError.value = null
  passwordTimer = setTimeout(() => {
    passwordBusy.value = false
    if (!passwordOpen.value)
      return
    if (value !== 'весна') {
      passwordError.value = 'Пароль не подошёл — проверьте раскладку'
      return
    }
    tokensRevoked.value = true
    passwordOpen.value = false
  }, 500)
}

onBeforeUnmount(() => clearTimeout(passwordTimer))

const noteOpen = ref(false)
const versionNote = ref('')
const versions = ref<string[]>([])

function openNote(): void {
  versionNote.value = ''
  noteOpen.value = true
}

function saveVersion(value: string): void {
  versions.value = [value.trim() || 'Без подписи', ...versions.value].slice(0, 3)
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-4 py-3 text-[var(--gr-card-fg)]">
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="truncate text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">{{ documentTitle }}</span>
        <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">Финансы · изменён вчера</span>
      </div>
      <GrButton variant="secondary" tone="neutral" size="sm" @click="openRename">
        <template #prefix>
          <IconPencil />
        </template>
        Переименовать
      </GrButton>
    </div>
    <GrPromptDialog
      v-model="renameOpen"
      v-model:value="renameDraft"
      title="Переименовать документ"
      label="Название"
      size="sm"
      confirm-text="Сохранить"
      cancel-text="Отмена"
      @confirm="applyRename"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Одно значение" note="Фокус сразу в поле, Enter подтверждает; пустое не сохранить, счётчик связан с полем.">
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-[var(--gr-card-fg)]">
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="truncate text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">{{ documentTitle }}</span>
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">Финансы · изменён вчера</span>
        </div>
        <GrButton variant="secondary" tone="neutral" size="sm" @click="openRename">
          <template #prefix>
            <IconPencil />
          </template>
          Переименовать
        </GrButton>
      </div>
      <GrPromptDialog
        v-model="renameOpen"
        v-model:value="renameDraft"
        title="Переименовать документ"
        label="Название"
        placeholder="Как назвать документ"
        size="sm"
        required
        required-error-text="Без названия документ не найти"
        :maxlength="60"
        show-count
        confirm-text="Сохранить"
        cancel-text="Отмена"
        @confirm="applyRename"
      />
    </Specimen>

    <Specimen title="Многострочный ответ с правилами" note="multiline растит поле с текстом, Enter — перевод строки; правила те же, что у формы, проверка — на уходе из поля и на подтверждении.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="outline" tone="danger" @click="openReject">
          <template #prefix>
            <IconBan />
          </template>
          Отклонить заявку
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ lastReason ? `Отклонено: ${lastReason}` : 'Заявка № 2041 ждёт решения' }}
      </p>
      <GrPromptDialog
        v-model="rejectOpen"
        v-model:value="rejectReason"
        title="Причина отказа"
        description="Автор заявки увидит этот текст и сможет исправить заявку."
        label="Причина"
        placeholder="Что именно не так"
        multiline
        :rows="3"
        autosize
        :maxlength="300"
        show-count
        :rules="rejectRules"
        confirm-text="Отклонить"
        cancel-text="Отмена"
        confirm-tone="danger"
        @confirm="lastReason = $event"
      />
    </Specimen>

    <Specimen title="Ответ сервера по полю" note="Пароль с autocomplete для менеджера паролей; пока идёт проверка — загрузка, отказ сервера — ошибкой поля. Верный пароль — «весна».">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" :disabled="tokensRevoked" @click="openPassword">
          <template #prefix>
            <IconLock />
          </template>
          Отозвать ключи API
        </GrButton>
        <GrButton v-if="tokensRevoked" variant="ghost" tone="neutral" size="sm" @click="tokensRevoked = false">
          Выпустить заново
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ tokensRevoked ? 'Ключи отозваны — интеграции остановлены' : 'Три ключа активны' }}
      </p>
      <GrPromptDialog
        v-model="passwordOpen"
        v-model:value="password"
        title="Подтвердите паролем"
        description="Все интеграции на этих ключах перестанут работать."
        label="Пароль"
        input-type="password"
        autocomplete="current-password"
        name="password"
        size="sm"
        confirm-text="Отозвать"
        cancel-text="Отмена"
        confirm-tone="danger"
        :field-error="passwordError"
        :confirm-loading="passwordBusy"
        :close-on-confirm="false"
        persistent
        @confirm="checkPassword"
      />
    </Specimen>

    <Specimen title="Необязательное значение" note="С required=false подтвердить можно и пустым — подпись к версии не обязательна.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" @click="openNote">
          <template #prefix>
            <IconGitCommit />
          </template>
          Сохранить версию
        </GrButton>
      </div>
      <ul v-if="versions.length" class="flex flex-col gap-1 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <li v-for="(version, index) in versions" :key="index">
          {{ version }}
        </li>
      </ul>
      <p v-else class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        Версий пока нет
      </p>
      <GrPromptDialog
        v-model="noteOpen"
        v-model:value="versionNote"
        title="Сохранить версию"
        label="Подпись"
        placeholder="Например, «после правок юристов»"
        size="sm"
        :required="false"
        confirm-text="Сохранить"
        cancel-text="Отмена"
        confirm-tone="primary"
        @confirm="saveVersion"
      />
    </Specimen>
  </div>
</template>
