<script setup lang="ts">
import IconPanelLeftClose from '~icons/lucide/panel-left-close'
import IconPanelLeftOpen from '~icons/lucide/panel-left-open'

import { ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const previewSize = ref(40)

const treeSize = ref(28)
const consoleSize = ref(68)
const projectFiles = ['index.ts', 'router.ts', 'theme.ts', 'App.vue']
const codeLines = [
  'export function createTheme(id: string) {',
  '  const pair = resolvePair(id)',
  '  return { id, light: pair.light, dark: pair.dark }',
  '}',
]

const letters = [
  { from: 'Типография «Оттиск»', subject: 'Пробный тираж готов' },
  { from: 'Анна Соколова', subject: 'Смета на весну' },
  { from: 'Банк', subject: 'Выписка за октябрь' },
  { from: 'Иван Петров', subject: 'Созвон в четверг' },
]
const inboxSize = ref(38)
const inboxCollapsed = ref(false)
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="h-[104px] overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]">
      <GrSplitter v-model="previewSize" :min="25" :max="70" aria-label="Граница списка писем">
        <template #start>
          <div class="flex h-full flex-col gap-1 overflow-hidden bg-[var(--gr-muted)] p-2">
            <span
              v-for="(letter, index) in letters.slice(0, 3)"
              :key="letter.subject"
              class="truncate rounded-[var(--gr-radius-sm)] px-2 py-1 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]"
              :class="index === 1 ? 'bg-[var(--gr-card)] font-600' : 'text-[var(--gr-muted-fg)]'"
            >
              {{ letter.from }}
            </span>
          </div>
        </template>
        <template #end>
          <div class="flex h-full flex-col gap-1 overflow-hidden p-3">
            <span class="truncate text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">Смета на весну</span>
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">Анна Соколова · 10:14</span>
          </div>
        </template>
      </GrSplitter>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Три панели вложением" note="границы тянутся мышью и стрелками; Shift — крупный шаг, Home и End — к пределам" wide>
      <div class="h-[280px] overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]">
        <GrSplitter v-model="treeSize" :min="18" :max="50" collapsible aria-label="Граница списка файлов">
          <template #start>
            <div class="flex h-full flex-col gap-1 overflow-hidden bg-[var(--gr-muted)] p-3">
              <span class="px-2 pb-1 text-[length:var(--gr-text-2xs)] font-600 leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">
                src/app
              </span>
              <span
                v-for="(file, index) in projectFiles"
                :key="file"
                class="truncate rounded-[var(--gr-radius-sm)] px-2 py-1 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]"
                :class="index === 2 ? 'bg-[var(--gr-card)] font-600' : 'text-[var(--gr-muted-fg)]'"
              >
                {{ file }}
              </span>
            </div>
          </template>
          <template #end>
            <GrSplitter v-model="consoleSize" orientation="vertical" :min="30" :max="85" aria-label="Граница консоли">
              <template #start>
                <div class="flex h-full flex-col gap-1 overflow-hidden p-4 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-base)]">
                  <span class="text-[var(--gr-muted-fg)]">theme.ts</span>
                  <code v-for="line in codeLines" :key="line" class="whitespace-pre">{{ line }}</code>
                </div>
              </template>
              <template #end>
                <div class="flex h-full flex-col gap-1 overflow-hidden border-t border-[var(--gr-brd)] p-3 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                  <span>$ yarn test</span>
                  <span class="text-[var(--gr-success-text)]">✓ 128 тестов прошли за 2,4 с</span>
                </div>
              </template>
            </GrSplitter>
          </template>
        </GrSplitter>
      </div>
    </Specimen>

    <Specimen title="Свёрнутая панель" note="сворачивание помнит прежний размер: Enter на границе, рывок к краю или кнопка; двойной щелчок — сброс">
      <div>
        <GrButton variant="secondary" tone="neutral" size="sm" @click="inboxCollapsed = !inboxCollapsed">
          <GrIcon>
            <component :is="inboxCollapsed ? IconPanelLeftOpen : IconPanelLeftClose" />
          </GrIcon>
          {{ inboxCollapsed ? 'Показать список' : 'Скрыть список' }}
        </GrButton>
      </div>
      <div class="h-[220px] overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]">
        <GrSplitter
          v-model="inboxSize"
          v-model:collapsed="inboxCollapsed"
          :default-size="38"
          :min="24"
          :max="60"
          :min-end="35"
          collapsible
          aria-label="Граница списка писем"
        >
          <template #start>
            <ul class="flex h-full flex-col overflow-hidden bg-[var(--gr-muted)] p-2">
              <li
                v-for="(letter, index) in letters"
                :key="letter.subject"
                class="flex flex-col rounded-[var(--gr-radius-sm)] px-2 py-1.5"
                :class="index === 1 ? 'bg-[var(--gr-card)]' : ''"
              >
                <span class="truncate text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)]">{{ letter.from }}</span>
                <span class="truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ letter.subject }}</span>
              </li>
            </ul>
          </template>
          <template #end>
            <div class="flex h-full flex-col gap-2 overflow-hidden p-4">
              <span class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">Смета на весну</span>
              <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
                Прикладываю смету запуска: печать, съёмка и площадка. Итог — 480 000 ₽, бюджет сходится.
              </p>
              <span class="mt-auto font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">
                список: {{ inboxCollapsed ? 'свёрнут' : `${Math.round(inboxSize)}%` }}
              </span>
            </div>
          </template>
        </GrSplitter>
      </div>
    </Specimen>
  </div>
</template>
