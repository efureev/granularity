<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import type { GrCommandItem } from '@feugene/granularity'
import IconArchive from '~icons/lucide/archive'
import IconDownload from '~icons/lucide/download'
import IconFileText from '~icons/lucide/file-text'
import IconFolder from '~icons/lucide/folder'
import IconHash from '~icons/lucide/hash'
import IconPlus from '~icons/lucide/plus'
import IconSearch from '~icons/lucide/search'
import IconSettings from '~icons/lucide/settings'
import IconUser from '~icons/lucide/user'
import IconUserPlus from '~icons/lucide/user-plus'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const commands: GrCommandItem[] = [
  { id: 'quarter-report', label: 'Отчёт за квартал', description: 'Финансы', icon: IconFileText, group: 'Документы' },
  { id: 'sales-report', label: 'Отчёт по продажам', description: 'Продажи', icon: IconFileText, group: 'Документы' },
  { id: 'launch-plan', label: 'План запуска', description: 'Проекты', icon: IconFileText, group: 'Документы' },
  { id: 'new-report', label: 'Новый отчёт', icon: IconPlus, group: 'Команды', shortcut: ['⌘', 'N'], keywords: ['создать'] },
  { id: 'export', label: 'Выгрузить отчёты в CSV', icon: IconDownload, group: 'Команды', keywords: ['экспорт', 'excel'] },
  { id: 'invite', label: 'Пригласить коллегу', icon: IconUserPlus, group: 'Команды', keywords: ['доступ'] },
  { id: 'settings', label: 'Настройки пространства', icon: IconSettings, group: 'Команды', shortcut: ['⌘', ','] },
  { id: 'archive', label: 'Архивировать пространство', description: 'Нужны права владельца', icon: IconArchive, group: 'Команды', disabled: true },
]
const paletteOpen = ref(false)
const recentCommands = ref<string[]>([])
const lastCommand = ref('')

function onCommand(item: GrCommandItem): void {
  lastCommand.value = item.label
  recentCommands.value = [item.id, ...recentCommands.value.filter(id => id !== item.id)].slice(0, 3)
}

const WORKSPACE: GrCommandItem[] = [
  { id: 'u-sokolova', label: 'Анна Соколова', description: 'Дизайн · Москва', icon: IconUser, group: 'Люди' },
  { id: 'u-petrov', label: 'Иван Петров', description: 'Аналитика · Казань', icon: IconUser, group: 'Люди' },
  { id: 'p-launch', label: 'Запуск весной', description: 'Проект · в работе', icon: IconFolder, group: 'Проекты' },
  { id: 'p-redesign', label: 'Редизайн сайта', description: 'Проект · запланирован', icon: IconFolder, group: 'Проекты' },
  { id: 'd-quarter', label: 'Отчёт за квартал.pdf', description: 'Документ · 2,4 МБ', icon: IconFileText, group: 'Документы' },
  { id: 'd-brief', label: 'Бриф запуска.docx', description: 'Документ · 340 КБ', icon: IconFileText, group: 'Документы' },
]
const remoteOpen = ref(false)
const remoteLoading = ref(false)
const remoteResults = ref<GrCommandItem[]>([])
const lastRemote = ref('')
let remoteTimer: ReturnType<typeof setTimeout> | undefined

function searchWorkspace(query: string): void {
  clearTimeout(remoteTimer)
  const needle = query.trim().toLowerCase()
  if (!needle) {
    remoteLoading.value = false
    remoteResults.value = []
    return
  }
  remoteLoading.value = true
  remoteTimer = setTimeout(() => {
    remoteResults.value = WORKSPACE.filter(item =>
      item.label.toLowerCase().includes(needle) || item.description?.toLowerCase().includes(needle),
    )
    remoteLoading.value = false
  }, 600)
}

onBeforeUnmount(() => clearTimeout(remoteTimer))

const tasks: GrCommandItem[] = Array.from({ length: 1000 }, (_, index) => {
  const number = String(index + 1).padStart(4, '0')
  return { id: `task-${number}`, label: `Задача ЗАД-${number}`, description: index % 3 === 0 ? 'Закрыта' : 'В работе', icon: IconHash, group: index < 500 ? 'Спринт 14' : 'Спринт 15' }
})
const tasksOpen = ref(false)
const lastTask = ref('')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrButton variant="secondary" tone="neutral" @click="paletteOpen = true">
        <template #prefix>
          <IconSearch />
        </template>
        Найти команду
      </GrButton>
      <span class="flex items-center gap-1.5 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        или <GrKbd keys="mod+k" size="sm" />
      </span>
    </div>
    <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
      Документы и команды в одном поиске
    </p>
    <!-- Сочетание в превью не регистрируется: образец рендерится на странице по нескольку раз. -->
    <GrCommandPalette
      v-model="paletteOpen"
      :items="commands"
      :hotkey="null"
      placeholder="Команда или поиск"
      aria-label="Палитра команд"
      empty-text="Ничего не нашлось — попробуйте другое слово"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Все команды в одном поиске" note="Кнопкой или ⌘K; группы, подсветка совпадения, недоступная команда пропускается стрелками, выбранные поднимаются в «Недавние».">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" @click="paletteOpen = true">
          <template #prefix>
            <IconSearch />
          </template>
          Найти команду
        </GrButton>
        <span class="flex items-center gap-1.5 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          или нажмите <GrKbd keys="mod+k" size="sm" />
        </span>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ lastCommand ? `Последняя команда: ${lastCommand}` : 'Попробуйте набрать «отч» или «экспорт»' }}
      </p>
      <GrCommandPalette
        v-model="paletteOpen"
        :items="commands"
        :recent-ids="recentCommands"
        placeholder="Команда или поиск"
        aria-label="Палитра команд"
        empty-text="Ничего не нашлось — попробуйте другое слово"
        @select="onCommand"
      >
        <template #footer>
          <span class="flex items-center gap-1"><GrKbd keys="↑" size="sm" /><GrKbd keys="↓" size="sm" /> выбор</span>
          <span class="flex items-center gap-1"><GrKbd keys="↵" size="sm" /> открыть</span>
          <span class="flex items-center gap-1"><GrKbd keys="Esc" size="sm" /> закрыть</span>
        </template>
      </GrCommandPalette>
    </Specimen>

    <Specimen title="Поиск на сервере" note="Фильтр отдан наружу: запрос уходит событием search, пока ждём — загрузка в живом регионе, пусто — своим текстом.">
      <div>
        <GrButton variant="secondary" tone="neutral" @click="remoteOpen = true">
          <template #prefix>
            <IconSearch />
          </template>
          Искать в пространстве
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ lastRemote ? `Открыто: ${lastRemote}` : 'Люди, проекты и документы — например, «отчёт»' }}
      </p>
      <GrCommandPalette
        v-model="remoteOpen"
        :items="remoteResults"
        :filterable="false"
        :loading="remoteLoading"
        :hotkey="null"
        placeholder="Люди, проекты, документы"
        aria-label="Поиск в пространстве"
        @search="searchWorkspace"
        @select="lastRemote = $event.label"
      >
        <template #empty="{ query }">
          {{ query ? `По запросу «${query}» ничего нет` : 'Начните вводить — ищем по всему пространству' }}
        </template>
      </GrCommandPalette>
    </Specimen>

    <Specimen title="Тысяча команд" note="virtual держит в DOM только окно вокруг видимых; стрелки докручивают список до активной команды.">
      <div>
        <GrButton variant="secondary" tone="neutral" @click="tasksOpen = true">
          <template #prefix>
            <IconHash />
          </template>
          Перейти к задаче
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ lastTask ? `Открыта: ${lastTask}` : 'Наберите номер, например «0420»' }}
      </p>
      <GrCommandPalette
        v-model="tasksOpen"
        :items="tasks"
        :hotkey="null"
        virtual
        :max-height="360"
        placeholder="Номер или название задачи"
        aria-label="Переход к задаче"
        @select="lastTask = $event.label"
      />
    </Specimen>
  </div>
</template>
