<script setup lang="ts">
import type { GrTab } from '@feugene/granularity'
import { ref, useId } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

// Связка вкладки с панелью — по общему idBase, а образец живёт на странице не в одном экземпляре.
const cardIdBase = useId()
const mailIdBase = useId()
const logIdBase = useId()
const orderIdBase = useId()

const CARD_TABS: GrTab[] = [
  { value: 'inbox', label: 'Входящие', badge: '2' },
  { value: 'sent', label: 'Отправленные' },
]
const CARD_PANELS: Record<string, string> = {
  inbox: 'Макеты тарифов на согласование',
  sent: 'Договор поставки — правки юристов',
}
const cardFolder = ref('inbox')

interface MailMessage {
  from: string
  subject: string
}

interface MailFolder {
  value: string
  label: string
  badge?: string
  messages: MailMessage[]
}

const MAIL_FOLDERS: MailFolder[] = [
  {
    value: 'inbox',
    label: 'Входящие',
    badge: '2',
    messages: [
      { from: 'Анна Смирнова', subject: 'Макеты тарифов на согласование' },
      { from: 'Бухгалтерия', subject: 'Счёт № 482 оплачен' },
    ],
  },
  {
    value: 'sent',
    label: 'Отправленные',
    messages: [{ from: 'Кому: Иван Петров', subject: 'Договор поставки — правки юристов' }],
  },
  {
    value: 'drafts',
    label: 'Черновики',
    messages: [{ from: 'Черновик', subject: 'Отчёт для инвесторов за март' }],
  },
]
const FOLDER_TABS: GrTab[] = MAIL_FOLDERS.map(({ value, label, badge }) => ({ value, label, badge }))
const folder = ref('inbox')

const LOG_TABS: GrTab[] = [
  { value: 'summary', label: 'Сводка' },
  { value: 'log', label: 'Журнал' },
]
const logTab = ref('summary')
const LOG_LINES = Array.from({ length: 24 }, (_, index) => {
  const minute = String(index * 2).padStart(2, '0')
  return `10:${minute} · Сборка № ${1240 + index} — ${index % 5 === 3 ? 'упала на тестах' : 'прошла'}`
})

const ORDER_TABS: GrTab[] = [
  { value: 'items', label: 'Состав' },
  { value: 'delivery', label: 'Доставка' },
  { value: 'history', label: 'История' },
]
const orderTab = ref('items')
const ORDER_ITEMS = [
  { title: 'Стеллаж складской, 2 м', count: '4 шт.' },
  { title: 'Полка усиленная', count: '16 шт.' },
]
const ORDER_HISTORY = ['Создан 3 марта', 'Оплачен 4 марта', 'Передан в доставку 6 марта']
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrTabs v-model="cardFolder" :tabs="CARD_TABS" :id-base="cardIdBase" aria-label="Папки почты" />
    <GrTabPanels :model-value="cardFolder" :id-base="cardIdBase">
      <GrTabPanel v-for="tab in CARD_TABS" :key="tab.value" :value="tab.value">
        <p class="truncate text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
          {{ CARD_PANELS[tab.value] }}
        </p>
      </GrTabPanel>
    </GrTabPanels>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="С GrTabs" note="Общий id-base связывает вкладку с её панелью для скринридера.">
      <GrTabs v-model="folder" :tabs="FOLDER_TABS" :id-base="mailIdBase" aria-label="Папки почты" />
      <GrTabPanels :model-value="folder" :id-base="mailIdBase">
        <GrTabPanel v-for="item in MAIL_FOLDERS" :key="item.value" :value="item.value">
          <ul class="flex flex-col gap-2">
            <li
              v-for="message in item.messages"
              :key="message.subject"
              class="flex flex-col gap-0.5 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] p-3"
            >
              <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                {{ message.from }}
              </span>
              <span class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
                {{ message.subject }}
              </span>
            </li>
          </ul>
        </GrTabPanel>
      </GrTabPanels>
    </Specimen>

    <Specimen title="Состояние панели" note="keep-alive оставляет скрытую панель в DOM — прокрутка журнала переживает смену вкладки; lazy монтирует её при первом показе.">
      <GrTabs v-model="logTab" :tabs="LOG_TABS" :id-base="logIdBase" aria-label="Сборки" />
      <GrTabPanels :model-value="logTab" :id-base="logIdBase">
        <GrTabPanel value="summary">
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            За утро 24 сборки, 5 упали на тестах. Прокрутите журнал, уйдите на «Сводку» и вернитесь — место в журнале сохранится.
          </p>
        </GrTabPanel>
        <GrTabPanel value="log" keep-alive lazy>
          <div
            tabindex="0"
            role="region"
            aria-label="Журнал сборок"
            class="flex h-40 flex-col gap-1 overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] p-3"
          >
            <p
              v-for="line in LOG_LINES"
              :key="line"
              class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-fg)]"
            >
              {{ line }}
            </p>
          </div>
        </GrTabPanel>
      </GrTabPanels>
    </Specimen>

    <Specimen title="Своя раскладка" note="Ряд — в шапке карточки, панели — в её теле: между ними может стоять что угодно, связь держит общий id-base." wide>
      <div class="flex flex-col rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--gr-brd)] px-4 py-3">
          <p class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            Заказ № 482
          </p>
          <GrTabs v-model="orderTab" :tabs="ORDER_TABS" :id-base="orderIdBase" size="sm" aria-label="Разделы заказа" />
        </div>
        <GrTabPanels :model-value="orderTab" :id-base="orderIdBase" class="p-4">
          <GrTabPanel value="items">
            <ul class="flex flex-col gap-2">
              <li
                v-for="item in ORDER_ITEMS"
                :key="item.title"
                class="flex items-baseline justify-between gap-4 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]"
              >
                <span class="text-[var(--gr-fg)]">{{ item.title }}</span>
                <span class="text-[var(--gr-muted-fg)]">{{ item.count }}</span>
              </li>
            </ul>
          </GrTabPanel>
          <GrTabPanel value="delivery">
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
              Курьером до склада на Северной, 12 · окно 10:00–14:00
            </p>
          </GrTabPanel>
          <GrTabPanel value="history">
            <ul class="flex flex-col gap-1 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
              <li v-for="step in ORDER_HISTORY" :key="step">
                {{ step }}
              </li>
            </ul>
          </GrTabPanel>
        </GrTabPanels>
      </div>
    </Specimen>
  </div>
</template>
