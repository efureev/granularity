<script setup lang="ts">
import type { GrSegmentedOption, GrTab } from '@feugene/granularity'
import { computed, ref } from 'vue'

import IconBell from '~icons/lucide/bell'
import IconShield from '~icons/lucide/shield'
import IconUser from '~icons/lucide/user'

import { plural } from '../plural'
import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const CARD_TABS: GrTab[] = [
  { value: 'overview', label: 'Обзор' },
  { value: 'tasks', label: 'Задачи' },
  { value: 'files', label: 'Файлы' },
]
const CARD_PANELS: Record<string, string> = {
  overview: 'Закрыто 18 задач за неделю',
  tasks: 'Согласовать договор с подрядчиком',
  files: 'Схема склада.pdf',
}
const cardTab = ref('overview')

type Period = 'day' | 'week' | 'month'

const PERIOD_OPTIONS: GrSegmentedOption[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]
const PERIOD_TEXT: Record<Period, string> = { day: 'за день', week: 'за неделю', month: 'за месяц' }
const PROJECT_STATS: Record<Period, { done: number, active: number, files: number }> = {
  day: { done: 3, active: 5, files: 2 },
  week: { done: 18, active: 7, files: 11 },
  month: { done: 64, active: 9, files: 37 },
}
const period = ref<Period>('week')

const PROJECT_TABS: GrTab[] = [
  { value: 'overview', label: 'Обзор' },
  { value: 'tasks', label: 'Задачи' },
  { value: 'files', label: 'Файлы' },
]
const projectTab = ref('overview')

const PROJECT_TASKS = [
  { title: 'Согласовать договор с подрядчиком', owner: 'Анна Смирнова' },
  { title: 'Обновить схему стеллажей', owner: 'Иван Петров' },
  { title: 'Сверить остатки после инвентаризации', owner: 'Ольга Ким' },
]
const PROJECT_FILES = ['Схема склада.pdf', 'Остатки на 1 марта.xlsx', 'Фото погрузки.zip']

const stats = computed(() => PROJECT_STATS[period.value])
const periodText = computed(() => PERIOD_TEXT[period.value])
const overviewFacts = computed(() => [
  { label: 'Закрыто задач', value: stats.value.done },
  { label: 'Взято в работу', value: stats.value.active },
  { label: 'Новых файлов', value: stats.value.files },
])

const SETTINGS_TABS: GrTab[] = [
  { value: 'profile', label: 'Профиль', icon: IconUser },
  { value: 'notifications', label: 'Уведомления', icon: IconBell },
  { value: 'security', label: 'Безопасность', icon: IconShield },
]
const settingsTab = ref('notifications')
const byMail = ref(true)

const REPORT_TABS: GrTab[] = [
  { value: 'sales', label: 'Продажи' },
  { value: 'stock', label: 'Остатки' },
  { value: 'returns', label: 'Возвраты' },
]
const REPORTS: Record<string, { lead: string, value: string }> = {
  sales: { lead: 'Выручка за март', value: '4 820 000 ₽' },
  stock: { lead: 'На складах сейчас', value: '12 400 позиций' },
  returns: { lead: 'Возвратов за март', value: '1,8 %' },
}
const report = ref('sales')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrTabsWithPanels v-model="cardTab" :tabs="CARD_TABS">
      <GrTabPanel v-for="tab in CARD_TABS" :key="tab.value" :value="tab.value">
        <p class="truncate text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
          {{ CARD_PANELS[tab.value] }}
        </p>
      </GrTabPanel>
    </GrTabsWithPanels>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="С GrSegmented" note="Одна модель на вкладки и панели. Вкладка меняет содержимое, сегмент — срез данных в нём." wide>
      <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] p-4 lg:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Проект «Северный склад»
          </p>
          <GrSegmented v-model="period" :options="PERIOD_OPTIONS" size="sm" aria-label="Период отчёта" />
        </div>

        <GrTabsWithPanels v-model="projectTab" :tabs="PROJECT_TABS">
          <GrTabPanel value="overview">
            <div class="grid gap-3 sm:grid-cols-3">
              <div
                v-for="fact in overviewFacts"
                :key="fact.label"
                class="flex flex-col gap-1 rounded-[var(--gr-radius-md)] bg-[var(--gr-muted)] p-3"
              >
                <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                  {{ fact.label }} {{ periodText }}
                </span>
                <span class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)]">
                  {{ fact.value }}
                </span>
              </div>
            </div>
          </GrTabPanel>

          <GrTabPanel value="tasks">
            <div class="flex flex-col gap-2">
              <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
                Закрыто {{ plural(stats.done, ['задача', 'задачи', 'задач']) }} {{ periodText }}, последние:
              </p>
              <ul class="flex flex-col gap-2">
                <li
                  v-for="task in PROJECT_TASKS"
                  :key="task.title"
                  class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] p-3"
                >
                  <span class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">{{ task.title }}</span>
                  <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ task.owner }}</span>
                </li>
              </ul>
            </div>
          </GrTabPanel>

          <GrTabPanel value="files">
            <div class="flex flex-col gap-2">
              <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
                Добавлено {{ plural(stats.files, ['файл', 'файла', 'файлов']) }} {{ periodText }}, последние:
              </p>
              <ul class="flex flex-col gap-2">
                <li
                  v-for="file in PROJECT_FILES"
                  :key="file"
                  class="rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] p-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]"
                >
                  {{ file }}
                </li>
              </ul>
            </div>
          </GrTabPanel>
        </GrTabsWithPanels>
      </div>
    </Specimen>

    <Specimen title="Вертикаль" note="orientation=&quot;vertical&quot; ставит ряд сбоку от панелей, а не колонкой над ними.">
      <GrTabsWithPanels v-model="settingsTab" :tabs="SETTINGS_TABS" orientation="vertical" aria-label="Разделы настроек">
        <GrTabPanel value="profile">
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            Имя, фото и часовой пояс — их видят коллеги в проектах.
          </p>
        </GrTabPanel>
        <GrTabPanel value="notifications">
          <div class="flex flex-col gap-3">
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
              Куда присылать упоминания и ответы.
            </p>
            <GrSwitch v-model="byMail">
              На почту
            </GrSwitch>
          </div>
        </GrTabPanel>
        <GrTabPanel value="security">
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            Пароль, второй фактор и активные сеансы.
          </p>
        </GrTabPanel>
      </GrTabsWithPanels>
    </Specimen>

    <Specimen title="Ручная активация" note="Стрелки ведут фокус, панель меняется по Enter или Space — тяжёлый отчёт не грузится на каждом шаге.">
      <GrTabsWithPanels v-model="report" :tabs="REPORT_TABS" activation-mode="manual">
        <GrTabPanel v-for="tab in REPORT_TABS" :key="tab.value" :value="tab.value">
          <div class="flex flex-col gap-1 rounded-[var(--gr-radius-md)] bg-[var(--gr-muted)] p-3">
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              {{ REPORTS[tab.value]?.lead }}
            </span>
            <span class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)]">
              {{ REPORTS[tab.value]?.value }}
            </span>
          </div>
        </GrTabPanel>
      </GrTabsWithPanels>
    </Specimen>
  </div>
</template>
