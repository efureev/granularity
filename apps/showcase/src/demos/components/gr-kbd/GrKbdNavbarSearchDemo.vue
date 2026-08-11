<script setup lang="ts">
import { ref } from 'vue'

import {
  GrAvatar,
  GrCommandPalette,
  GrKbd,
  GrNavbar,
  vHotkey,
  type GrCommandItem,
} from '@feugene/granularity'

import SearchIcon from '~icons/lucide/search'

const isSearchOpen = ref(false)
const lastPicked = ref<string | null>(null)

/** Токен `mod` один и тот же в привязке и в подсказке: Cmd на macOS, Ctrl на прочих. */
const searchHotkey = {
  scope: 'element' as const,
  handlers: {
    'mod+K': { handler: () => (isSearchOpen.value = true), stopPropagation: true },
  },
}

const items: GrCommandItem[] = [
  { id: 'orders', label: 'Заказы', description: 'Список и статусы', shortcut: ['mod', 'O'] },
  { id: 'customers', label: 'Клиенты', description: 'Карточки и сегменты', shortcut: ['mod', 'U'] },
  { id: 'settings', label: 'Настройки', description: 'Оплата, доставка, роли', shortcut: ['mod', ','] },
  { id: 'logs', label: 'Журнал событий', description: 'Аудит действий' },
]

function onSelect(item: GrCommandItem): void {
  lastPicked.value = item.label
}
</script>

<template>
  <!--
    Хоткей ограничен демо (`scope: 'element'`) и гасит всплытие: у самой витрины
    ⌘K уже занят её поиском, и глобальная привязка открыла бы обе панели сразу.
    В приложении scope не нужен — там сочетание слушает окно.
  -->
  <div
    v-hotkey="searchHotkey"
    tabindex="0"
    class="grid gap-3 rounded-[var(--gr-radius-lg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
  >
    <GrNavbar title="Консоль">
      <template #center>
        <!--
          Кнопка-поле: подпись даёт имя, а сочетание рядом декоративно —
          диктору его сообщает `aria-keyshortcuts`.
        -->
        <button
          type="button"
          class="inline-flex h-8 items-center gap-2 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] px-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-tight)] text-[var(--gr-muted-fg)] transition-colors hover:bg-[var(--gr-bg)]"
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          @click="isSearchOpen = true"
        >
          <SearchIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Поиск</span>
          <span class="ml-2 inline-flex" aria-hidden="true">
            <GrKbd keys="mod+K" size="sm" />
          </span>
        </button>
      </template>

      <GrAvatar name="Ирина Петрова" size="sm" />
    </GrNavbar>

    <p class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
      Нажмите <GrKbd keys="mod+K" size="sm" />, когда фокус внутри демо, — или кликните по кнопке.
      <template v-if="lastPicked">
        Выбрано: <strong class="text-[var(--gr-fg)]">{{ lastPicked }}</strong>.
      </template>
    </p>

    <!-- `hotkey: null` — сочетание уже слушает демо, второй слушатель открыл бы панель дважды. -->
    <GrCommandPalette
      v-model="isSearchOpen"
      :items="items"
      :hotkey="null"
      placeholder="Раздел, действие, документ"
      aria-label="Поиск по консоли"
      @select="onSelect"
    />
  </div>
</template>
