<script setup lang="ts">
import type { GrTab, GrTabsVariant } from '@feugene/granularity'
import { computed, reactive, ref } from 'vue'

import IconBell from '~icons/lucide/bell'
import IconCreditCard from '~icons/lucide/credit-card'
import IconShield from '~icons/lucide/shield'
import IconUser from '~icons/lucide/user'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const
const VARIANTS: readonly GrTabsVariant[] = ['pills', 'line']

const CARD_TABS: GrTab[] = [
  { value: 'overview', label: 'Обзор' },
  { value: 'tasks', label: 'Задачи', badge: '12' },
  { value: 'files', label: 'Файлы' },
]
const cardTab = ref('tasks')

const SECTION_TABS: GrTab[] = [
  { value: 'overview', label: 'Обзор' },
  { value: 'tasks', label: 'Задачи', badge: '12' },
  { value: 'files', label: 'Файлы' },
  { value: 'settings', label: 'Настройки' },
]
const section = ref('overview')

const SETTINGS_TABS: GrTab[] = [
  { value: 'profile', label: 'Профиль', icon: IconUser },
  { value: 'notifications', label: 'Уведомления', icon: IconBell, badge: '3' },
  { value: 'security', label: 'Безопасность', icon: IconShield },
  { value: 'billing', label: 'Оплата', icon: IconCreditCard, disabled: true },
]
const settingsTab = ref('notifications')

const variantTab = reactive<Record<GrTabsVariant, string>>({ pills: 'tasks', line: 'tasks' })

const STEP_TABS: GrTab[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]
const stepTab = ref('week')

const OPEN_FILES: GrTab[] = [
  { value: 'board', label: 'Доска', closable: false },
  { value: 'plan', label: 'План.md' },
  { value: 'report', label: 'Отчёт за март.xlsx' },
  { value: 'contract', label: 'Договор поставки.pdf' },
]
const openFiles = ref<GrTab[]>(OPEN_FILES.map(tab => ({ ...tab })))
const openFile = ref('plan')

function closeFile(value: string): void {
  const index = openFiles.value.findIndex(tab => tab.value === value)
  if (index < 0)
    return
  openFiles.value.splice(index, 1)
  if (openFile.value === value)
    openFile.value = openFiles.value[index]?.value ?? openFiles.value[index - 1]?.value ?? ''
}

function reopenFiles(): void {
  openFiles.value = OPEN_FILES.map(tab => ({ ...tab }))
}

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const MONTH_TABS: GrTab[] = MONTHS.map((label, index) => ({ value: String(index + 1), label }))
const month = ref('6')

const REPORT_TABS: GrTab[] = [
  { value: 'sales', label: 'Продажи' },
  { value: 'stock', label: 'Остатки' },
  { value: 'returns', label: 'Возвраты' },
]
const report = ref('sales')
const reportLabel = computed(() => REPORT_TABS.find(tab => tab.value === report.value)?.label)

const ENV_TABS: GrTab[] = [
  { value: 'prod', label: 'Продакшен' },
  { value: 'stage', label: 'Стейджинг' },
  { value: 'dev', label: 'Разработка' },
]
const ENV_META: Record<string, { dot: string, version: string }> = {
  prod: { dot: 'bg-[var(--gr-success)]', version: 'v3.1' },
  stage: { dot: 'bg-[var(--gr-warning)]', version: 'v3.2' },
  dev: { dot: 'bg-[var(--gr-muted-fg)]', version: 'v3.3' },
}
const env = ref('prod')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrTabs v-model="cardTab" :tabs="CARD_TABS" aria-label="Разделы проекта" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Ряд" note="Вид ряда выбирает тема; счётчик — поле badge у вкладки.">
      <GrTabs v-model="section" :tabs="SECTION_TABS" aria-label="Разделы проекта" />
    </Specimen>

    <Specimen title="Вертикаль" note="Разделы настроек: иконки в линию, недоступную вкладку диктор объявляет, а стрелки пропускают.">
      <!-- Обёртка держит ширину по содержимому: колонка образца растянула бы ряд на всю ширину. -->
      <div>
        <GrTabs v-model="settingsTab" :tabs="SETTINGS_TABS" orientation="vertical" aria-label="Разделы настроек" />
      </div>
    </Specimen>

    <Specimen title="Варианты" note="pills — таблетки в общей обойме, line — подчёркивание активной; приложению вид задаёт тема.">
      <div v-for="variant in VARIANTS" :key="variant" class="flex flex-col gap-2">
        <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ variant }}
        </span>
        <GrTabs v-model="variantTab[variant]" :tabs="CARD_TABS" :variant="variant" :aria-label="`Разделы проекта, вид ${variant}`" />
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Высота — шкала GrButton: 28 · 32 · 40 · 44; lg — цель под палец.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <div class="min-w-0">
            <GrTabs v-model="stepTab" :tabs="STEP_TABS" :size="size" :aria-label="`Период, ступень ${size}`" />
          </div>
        </template>
      </div>
    </Specimen>

    <Specimen title="Закрываемые" note="Крестик и Delete на вкладке; «Доска» закреплена, список ведёт экран.">
      <GrTabs v-model="openFile" :tabs="openFiles" closable aria-label="Открытые файлы" @close="closeFile" />
      <div v-if="openFiles.length < OPEN_FILES.length">
        <GrButton size="sm" variant="ghost" tone="neutral" @click="reopenFiles">
          Открыть закрытые
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Пустой ряд" note="Без вкладок tablist не рендерится: текст держит высоту вкладки, соседи не прыгают.">
      <GrTabs model-value="" :tabs="[]" empty-text="Нет открытых файлов" />
    </Specimen>

    <Specimen title="Переполнение" note="Ряд прокручивается, а не переносится; гаснет тот край, за которым ещё есть вкладки.">
      <div class="w-full max-w-80">
        <GrTabs v-model="month" :tabs="MONTH_TABS" aria-label="Месяц отчёта" />
      </div>
    </Specimen>

    <Specimen title="Ручная активация" note="activation-mode=&quot;manual&quot;: стрелка ведёт только фокус, выбор — Enter или Space. Для вкладок с тяжёлой загрузкой.">
      <GrTabs v-model="report" :tabs="REPORT_TABS" activation-mode="manual" aria-label="Отчёты" />
      <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        Загружен отчёт: {{ reportLabel }}
      </p>
    </Specimen>

    <Specimen title="Своя разметка" note="Слот #tab получает { tab, active } и заменяет подпись, иконку и счётчик; крестик остаётся за компонентом." wide>
      <GrTabs v-model="env" :tabs="ENV_TABS" aria-label="Окружения">
        <template #tab="{ tab, active }">
          <span aria-hidden="true" class="h-2 w-2 shrink-0 rounded-[var(--gr-radius-full)]" :class="ENV_META[tab.value]?.dot" />
          <span :class="active ? 'font-600' : undefined">{{ tab.label }}</span>
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ ENV_META[tab.value]?.version }}</span>
        </template>
      </GrTabs>
    </Specimen>
  </div>
</template>
