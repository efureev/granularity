<script setup lang="ts">
import { ref } from 'vue'

import type { GrSelectOptionOrGroup } from '@feugene/granularity'
import IconExpand from '~icons/lucide/expand'
import IconKeyboard from '~icons/lucide/keyboard'
import IconUsers from '~icons/lucide/users'
import IconX from '~icons/lucide/x'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const hotkeysOpen = ref(false)
const hotkeys = [
  { keys: 'mod+k', label: 'Палитра команд' },
  { keys: 'mod+n', label: 'Новый документ' },
  { keys: 'mod+s', label: 'Сохранить' },
  { keys: 'mod+d', label: 'Дублировать' },
  { keys: 'F2', label: 'Переименовать' },
  { keys: 'mod+shift+s', label: 'Поделиться' },
  { keys: 'g i', label: 'Входящие' },
  { keys: 'Esc', label: 'Закрыть окно' },
]

const previewOpen = ref(false)
const reportPages = [
  { title: 'Выручка', value: '48,2 млн ₽', note: '+12% к прошлому кварталу' },
  { title: 'Новые клиенты', value: '1 340', note: 'из них 210 — корпоративные' },
  { title: 'Возвраты', value: '2,1%', note: 'ниже цели на 0,4 п.' },
]

const membersOpen = ref(false)
const inviteOpen = ref(false)
const members = ref([
  { name: 'Анна Соколова', role: 'Владелец' },
  { name: 'Иван Петров', role: 'Редактор' },
])
const inviteName = ref('')
const inviteRole = ref('viewer')
const roleOptions: GrSelectOptionOrGroup[] = [
  { value: 'viewer', label: 'Читатель' },
  { value: 'editor', label: 'Редактор' },
  { value: 'owner', label: 'Владелец' },
]

function openInvite(): void {
  inviteName.value = ''
  inviteRole.value = 'viewer'
  inviteOpen.value = true
}

function invite(): void {
  const name = inviteName.value.trim()
  if (!name)
    return
  const role = roleOptions.find(option => 'value' in option && option.value === inviteRole.value)?.label ?? ''
  members.value = [...members.value, { name, role }]
  inviteOpen.value = false
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div>
      <GrButton variant="secondary" tone="neutral" @click="hotkeysOpen = true">
        <template #prefix>
          <IconKeyboard />
        </template>
        Горячие клавиши
      </GrButton>
    </div>
    <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
      Окно со своей раскладкой
    </p>
    <GrModal v-model="hotkeysOpen" size="md" aria-label="Горячие клавиши">
      <div class="flex flex-col gap-4 p-6">
        <dl class="flex flex-col gap-2">
          <div
            v-for="hotkey in hotkeys.slice(0, 4)"
            :key="hotkey.keys"
            class="flex items-center justify-between gap-3 border-b border-[var(--gr-brd)] py-2"
          >
            <dt class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
              {{ hotkey.label }}
            </dt>
            <dd>
              <GrKbd :keys="hotkey.keys" size="sm" />
            </dd>
          </div>
        </dl>
        <div class="flex justify-end">
          <GrButton @click="hotkeysOpen = false">
            Понятно
          </GrButton>
        </div>
      </div>
    </GrModal>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Своя раскладка" note="Только слой: подложка, ловушка фокуса, Esc и блокировка прокрутки. Поля, заголовок и действия — ваши.">
      <div>
        <GrButton variant="secondary" tone="neutral" @click="hotkeysOpen = true">
          <template #prefix>
            <IconKeyboard />
          </template>
          Горячие клавиши
        </GrButton>
      </div>
      <GrModal v-model="hotkeysOpen" size="lg">
        <template #title>
          <h2 class="px-6 pt-6 text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">
            Горячие клавиши
          </h2>
        </template>
        <template #description>
          <p class="px-6 pt-1 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            Работают везде, кроме полей ввода.
          </p>
        </template>
        <div class="flex flex-col gap-5 p-6">
          <dl class="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            <div
              v-for="hotkey in hotkeys"
              :key="hotkey.keys"
              class="flex items-center justify-between gap-3 border-b border-[var(--gr-brd)] py-2"
            >
              <dt class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
                {{ hotkey.label }}
              </dt>
              <dd>
                <GrKbd :keys="hotkey.keys" size="sm" />
              </dd>
            </div>
          </dl>
          <div class="flex justify-end">
            <GrButton @click="hotkeysOpen = false">
              Понятно
            </GrButton>
          </div>
        </div>
      </GrModal>
    </Specimen>

    <Specimen title="Во весь экран" note="Ступень full занимает вьюпорт целиком, без полей и скруглений: предпросмотр, мастер, конструктор.">
      <div>
        <GrButton variant="secondary" tone="neutral" @click="previewOpen = true">
          <template #prefix>
            <IconExpand />
          </template>
          Предпросмотр отчёта
        </GrButton>
      </div>
      <GrModal v-model="previewOpen" size="full" scroll-behavior="inside">
        <template #title>
          <span class="sr-only">Предпросмотр отчёта</span>
        </template>
        <template #header>
          <div class="flex items-center justify-between gap-3 border-b border-[var(--gr-brd)] px-6 py-3">
            <span class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">
              Отчёт за третий квартал
            </span>
            <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Закрыть предпросмотр" @click="previewOpen = false">
              <IconX />
            </GrButton>
          </div>
        </template>
        <div class="flex justify-center bg-[var(--gr-muted)] p-6">
          <article class="flex w-full max-w-3xl flex-col gap-6 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-8 text-[var(--gr-card-fg)]">
            <h3 class="text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">
              Итоги квартала
            </h3>
            <div class="grid gap-4 sm:grid-cols-3">
              <div v-for="page in reportPages" :key="page.title" class="flex flex-col gap-1">
                <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">{{ page.title }}</span>
                <span class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)]">{{ page.value }}</span>
                <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ page.note }}</span>
              </div>
            </div>
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
              Рост дали корпоративные клиенты и повторные заказы. Во втором полугодии упор — на удержание: возвраты уже ниже цели, а средний чек вырос второй квартал подряд.
            </p>
          </article>
        </div>
      </GrModal>
    </Specimen>

    <Specimen title="Окно поверх окна" note="Esc закрывает верхнее, нижнее на это время в inert; панель селекта внутри окна выше него и фокус не теряет.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" @click="membersOpen = true">
          <template #prefix>
            <IconUsers />
          </template>
          Участники проекта
        </GrButton>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ members.length }} в команде
        </p>
      </div>
      <GrModal v-model="membersOpen" size="md">
        <template #title>
          <h2 class="px-6 pt-6 text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">
            Участники проекта
          </h2>
        </template>
        <div class="flex flex-col gap-4 p-6">
          <ul class="flex flex-col">
            <li
              v-for="member in members"
              :key="member.name"
              class="flex items-center justify-between gap-3 border-b border-[var(--gr-brd)] py-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]"
            >
              <span>{{ member.name }}</span>
              <span class="text-[var(--gr-muted-fg)]">{{ member.role }}</span>
            </li>
          </ul>
          <div class="flex justify-end gap-2">
            <GrButton variant="ghost" tone="neutral" @click="membersOpen = false">
              Закрыть
            </GrButton>
            <GrButton @click="openInvite">
              Пригласить
            </GrButton>
          </div>
        </div>
      </GrModal>
      <GrModal v-model="inviteOpen" size="sm">
        <template #title>
          <h2 class="px-6 pt-6 text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">
            Приглашение
          </h2>
        </template>
        <form class="flex flex-col gap-4 p-6" novalidate @submit.prevent="invite">
          <GrFormField label="Имя или почта" required>
            <GrInput v-model="inviteName" placeholder="Кого пригласить" />
          </GrFormField>
          <GrFormField label="Роль">
            <GrSelect v-model="inviteRole" :options="roleOptions" options-view="panel" />
          </GrFormField>
          <div class="flex justify-end gap-2">
            <GrButton variant="ghost" tone="neutral" @click="inviteOpen = false">
              Отмена
            </GrButton>
            <GrButton type="submit" :disabled="!inviteName.trim()">
              Пригласить
            </GrButton>
          </div>
        </form>
      </GrModal>
    </Specimen>
  </div>
</template>
