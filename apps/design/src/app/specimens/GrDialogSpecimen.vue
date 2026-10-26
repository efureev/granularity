<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import type { GrDialogSize } from '@feugene/granularity'
import IconBell from '~icons/lucide/bell'
import IconMail from '~icons/lucide/mail'
import IconPlus from '~icons/lucide/plus'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const createOpen = ref(false)
const projectName = ref('')
const inviteTeam = ref(true)
const createTouched = ref(false)
const projects = ref(['Редизайн сайта', 'Отчёт за квартал'])
const createFormId = useId()
const projectNameError = computed(() =>
  createTouched.value && !projectName.value.trim() ? 'Без названия проект не создать' : undefined,
)

function openCreate(): void {
  projectName.value = 'Запуск весной'
  inviteTeam.value = true
  createTouched.value = false
  createOpen.value = true
}

function createProject(): void {
  createTouched.value = true
  const name = projectName.value.trim()
  if (!name)
    return
  projects.value = [...projects.value, name]
  createOpen.value = false
}

const notificationsOpen = ref(false)
const notificationGroups = [
  {
    title: 'Задачи',
    items: [
      { key: 'assigned', label: 'Назначили задачу' },
      { key: 'mentioned', label: 'Упомянули в комментарии' },
      { key: 'due', label: 'Подходит срок' },
      { key: 'overdue', label: 'Срок прошёл' },
    ],
  },
  {
    title: 'Проекты',
    items: [
      { key: 'invited', label: 'Пригласили в проект' },
      { key: 'status', label: 'Сменился статус проекта' },
      { key: 'files', label: 'Добавили файлы' },
      { key: 'archived', label: 'Проект ушёл в архив' },
    ],
  },
  {
    title: 'Пространство',
    items: [
      { key: 'members', label: 'Новые участники' },
      { key: 'billing', label: 'Счета и оплата' },
      { key: 'security', label: 'Входы с новых устройств' },
      { key: 'digest', label: 'Еженедельная сводка' },
    ],
  },
]
const notifications = ref<Record<string, boolean>>({ assigned: true, mentioned: true, due: true, overdue: true, invited: true, security: true, digest: false })
const notificationsCount = computed(() => Object.values(notifications.value).filter(Boolean).length)

const SIZES: readonly GrDialogSize[] = ['sm', 'md', 'lg', 'xl', 'full']
const sizeOpen = ref(false)
const sizeChoice = ref<GrDialogSize>('md')

function openSized(size: GrDialogSize): void {
  sizeChoice.value = size
  sizeOpen.value = true
}

const letterOpen = ref(false)
const letterSubject = ref('Итоги квартала')
const letterBody = ref('')
const lettersSent = ref(0)

function sendLetter(): void {
  lettersSent.value += 1
  letterBody.value = ''
  letterOpen.value = false
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div>
      <GrButton @click="openCreate">
        <template #prefix>
          <IconPlus />
        </template>
        Новый проект
      </GrButton>
    </div>
    <p class="truncate text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      {{ projects.join(' · ') }}
    </p>
    <GrDialog v-model="createOpen" title="Новый проект" size="md">
      <form :id="createFormId" class="flex flex-col gap-4" novalidate @submit.prevent="createProject">
        <GrFormField label="Название" :error="projectNameError" required>
          <GrInput v-model="projectName" placeholder="Например, «Запуск весной»" />
        </GrFormField>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <GrButton variant="ghost" tone="neutral" @click="createOpen = false">
            Отмена
          </GrButton>
          <GrButton type="submit" :form="createFormId">
            Создать
          </GrButton>
        </div>
      </template>
    </GrDialog>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Форма в окне" note="Шапка с крестиком, тело с полями, действия справа внизу; Enter в поле отправляет форму.">
      <div class="flex flex-col gap-3">
        <ul class="flex flex-wrap gap-2">
          <li
            v-for="project in projects"
            :key="project"
            class="rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-3 py-1.5 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-card-fg)]"
          >
            {{ project }}
          </li>
        </ul>
        <div>
          <GrButton @click="openCreate">
            <template #prefix>
              <IconPlus />
            </template>
            Новый проект
          </GrButton>
        </div>
      </div>
      <GrDialog v-model="createOpen" title="Новый проект" size="md">
        <form :id="createFormId" class="flex flex-col gap-4" novalidate @submit.prevent="createProject">
          <GrFormField label="Название" :error="projectNameError" required>
            <GrInput v-model="projectName" placeholder="Например, «Запуск весной»" />
          </GrFormField>
          <GrCheckbox v-model="inviteTeam">
            Пригласить команду
          </GrCheckbox>
        </form>
        <template #footer>
          <div class="flex justify-end gap-2">
            <GrButton variant="ghost" tone="neutral" @click="createOpen = false">
              Отмена
            </GrButton>
            <GrButton type="submit" :form="createFormId">
              Создать
            </GrButton>
          </div>
        </template>
      </GrDialog>
    </Specimen>

    <Specimen title="Длинное содержимое" note="Прокрутка inside: шапка и подвал на месте, едет только тело — до кнопки не надо доскролливать.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" @click="notificationsOpen = true">
          <template #prefix>
            <IconBell />
          </template>
          Уведомления
        </GrButton>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Включено {{ notificationsCount }} из 12
        </p>
      </div>
      <GrDialog v-model="notificationsOpen" title="Уведомления" size="md" scroll-behavior="inside">
        <div class="flex flex-col gap-6">
          <section v-for="group in notificationGroups" :key="group.title" class="flex flex-col gap-3">
            <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
              {{ group.title }}
            </h3>
            <GrSwitch v-for="item in group.items" :key="item.key" v-model="notifications[item.key]">
              {{ item.label }}
            </GrSwitch>
          </section>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <GrButton @click="notificationsOpen = false">
              Готово
            </GrButton>
          </div>
        </template>
      </GrDialog>
    </Specimen>

    <Specimen title="Ступени ширины" note="sm · md · lg · xl меняют только ширину панели; full — во весь экран, без полей и скруглений.">
      <div class="flex flex-wrap gap-2">
        <GrButton v-for="size in SIZES" :key="size" variant="secondary" tone="neutral" size="sm" @click="openSized(size)">
          {{ size }}
        </GrButton>
      </div>
      <GrDialog v-model="sizeOpen" :title="`Окно ступени ${sizeChoice}`" :size="sizeChoice">
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Поля, шапка и подвал не меняются — растёт только ширина панели.
        </p>
        <template #footer>
          <div class="flex justify-end">
            <GrButton @click="sizeOpen = false">
              Понятно
            </GrButton>
          </div>
        </template>
      </GrDialog>
    </Specimen>

    <Specimen title="Своя шапка, без закрытия мимо" note="Слот header заменяет шапку, крестик остаётся; щелчок по подложке не теряет набранное — закрывают Esc, крестик и кнопки.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" @click="letterOpen = true">
          <template #prefix>
            <IconMail />
          </template>
          Написать команде
        </GrButton>
        <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ lettersSent ? `Отправлено писем: ${lettersSent}` : 'Писем пока не было' }}
        </p>
      </div>
      <GrDialog v-model="letterOpen" title="Письмо команде" size="lg" :close-on-backdrop="false">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="text-[length:var(--gr-control-text-md)] font-700 leading-[var(--gr-control-leading-md)]">
              Письмо команде
            </span>
            <GrBadge tone="neutral">
              Черновик
            </GrBadge>
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <GrFormField label="Тема">
            <GrInput v-model="letterSubject" />
          </GrFormField>
          <GrFormField label="Текст">
            <GrTextarea v-model="letterBody" :rows="5" placeholder="Что важно знать команде" />
          </GrFormField>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <GrButton variant="ghost" tone="neutral" @click="letterOpen = false">
              Отмена
            </GrButton>
            <GrButton :disabled="!letterBody.trim()" @click="sendLetter">
              Отправить
            </GrButton>
          </div>
        </template>
      </GrDialog>
    </Specimen>
  </div>
</template>
