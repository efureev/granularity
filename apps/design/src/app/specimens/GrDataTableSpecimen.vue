<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type { GrTone } from '@feugene/granularity'
import type { GrColumnPin, GrDataColumn } from '@feugene/granularity/components/GrDataTable'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const numbers = new Intl.NumberFormat('ru-RU')

function rub(value: number): string {
  return `${numbers.format(value)}\u00A0₽`
}

type Invoice = {
  no: string
  client: string
  inn: string
  status: string
  tone: GrTone
  sum: number
  due: string
  manager: string
  payment: string
  details: string
}

const invoices: Invoice[] = [
  { no: 'СЧ-1046', client: 'Студия «Лён»', inn: '7704123456', status: 'Оплачен', tone: 'success', sum: 48_000, due: '24 окт', manager: 'Анна Соколова', payment: 'Карта', details: '2 позиции · фирменный стиль и вёрстка презентации · оплачено картой 24 октября' },
  { no: 'СЧ-1045', client: 'ООО «Ромашка»', inn: '5009087654', status: 'Ждёт оплаты', tone: 'warning', sum: 12_400, due: '28 окт', manager: 'Илья Орлов', payment: 'Счёт', details: '1 позиция · поддержка сайта за октябрь · счёт отправлен на почту бухгалтерии' },
  { no: 'СЧ-1044', client: 'Иван Петров', inn: '—', status: 'Просрочен', tone: 'danger', sum: 7_900, due: '15 окт', manager: 'Анна Соколова', payment: 'СБП', details: '1 позиция · консультация · напоминание отправлено 18 октября' },
  { no: 'СЧ-1043', client: 'Типография «Строка»', inn: '7811456789', status: 'Оплачен', tone: 'success', sum: 132_500, due: '12 окт', manager: 'Мария Белова', payment: 'Счёт', details: '4 позиции · тираж каталога · закрывающие документы подписаны' },
  { no: 'СЧ-1042', client: 'Кафе «Глина»', inn: '6658012345', status: 'Черновик', tone: 'neutral', sum: 3_600, due: '—', manager: 'Илья Орлов', payment: '—', details: 'Черновик · ждёт согласования суммы с клиентом' },
  { no: 'СЧ-1041', client: 'Бюро «Чертёж»', inn: '7720345678', status: 'Оплачен', tone: 'success', sum: 26_000, due: '2 окт', manager: 'Мария Белова', payment: 'Карта', details: '3 позиции · обучение команды · оплачено картой 2 октября' },
]

const previewColumns: GrDataColumn<Invoice>[] = [
  { key: 'client', label: 'Клиент' },
  { key: 'sum', label: 'Сумма', sortable: true, align: 'right' },
]
const previewRows = invoices.slice(0, 2)
const previewSelected = ref<Array<string | number>>(['СЧ-1046'])

// Ширины задают таблице больше места, чем есть у образца: без прокрутки закреплённой колонке нечего держать.
const invoiceColumns: GrDataColumn<Invoice>[] = [
  { key: 'no', label: 'Номер', sortable: true, pinned: 'left', width: 120 },
  { key: 'client', label: 'Клиент', width: 220 },
  { key: 'status', label: 'Статус', width: 150 },
  { key: 'sum', label: 'Сумма', sortable: true, align: 'right', width: 140 },
  { key: 'due', label: 'Срок', width: 110 },
  { key: 'inn', label: 'ИНН', width: 140 },
  { key: 'manager', label: 'Ответственный', width: 180 },
  { key: 'payment', label: 'Оплата', width: 110 },
]

const invoicesTitleId = useId()
const selectedInvoices = ref<Array<string | number>>(['СЧ-1043'])
const expandedInvoices = ref<Array<string | number>>(['СЧ-1046'])
const invoicesPage = ref(1)

const selectedText = computed(() => (
  selectedInvoices.value.length === 0 ? 'Ничего не выбрано' : `Выбрано: ${selectedInvoices.value.length}`
))

const invoicesSummary = computed(() => ({
  no: 'Итого',
  sum: invoices.reduce((total, invoice) => total + invoice.sum, 0),
}))

function isSelectable(row: Invoice): boolean {
  return row.status !== 'Черновик'
}

type Order = {
  id: string
  title: string
  sum: number
}

const orderColumns: GrDataColumn<Order>[] = [
  { key: 'title', label: 'Заказ' },
  { key: 'sum', label: 'Сумма', align: 'right' },
]

const noOrders: Order[] = []

const tunedColumns: GrDataColumn<Invoice>[] = [
  { key: 'no', label: 'Номер', sortable: true },
  { key: 'client', label: 'Клиент', sortable: true },
  { key: 'manager', label: 'Ответственный', sortable: true },
  { key: 'payment', label: 'Оплата' },
  { key: 'sum', label: 'Сумма', sortable: true, align: 'right' },
]
const initialOrder = tunedColumns.map(column => column.key)
const columnOrder = ref<string[]>([...initialOrder])
const columnWidths = ref<Record<string, number>>({})
const pinnedColumns = ref<Record<string, GrColumnPin>>({})

const orderText = computed(() => columnOrder.value
  .map(key => tunedColumns.find(column => column.key === key)?.label)
  .filter(Boolean)
  .join(' · '))

const isTuned = computed(() => columnOrder.value.join() !== initialOrder.join()
  || Object.keys(columnWidths.value).length > 0
  || Object.keys(pinnedColumns.value).length > 0)

function resetColumns(): void {
  columnOrder.value = [...initialOrder]
  columnWidths.value = {}
  pinnedColumns.value = {}
}

type Person = {
  id: string
  name: string
  role: string
  city: string
}

const people: Person[] = [
  { id: 'anna', name: 'Анна Соколова', role: 'Финансы', city: 'Москва' },
  { id: 'ilya', name: 'Илья Орлов', role: 'Продажи', city: 'Казань' },
  { id: 'maria', name: 'Мария Белова', role: 'Бухгалтерия', city: 'Москва' },
  { id: 'oleg', name: 'Олег Смирнов', role: 'Поддержка', city: 'Пермь' },
]

const peopleColumns: GrDataColumn<Person>[] = [
  { key: 'name', label: 'Сотрудник', sortable: true },
  { key: 'role', label: 'Отдел' },
  { key: 'city', label: 'Город' },
  { key: 'actions', label: 'Профиль', align: 'right' },
]
const openedPerson = ref<string | null>(null)

type Operation = {
  id: number
  date: string
  counterparty: string
  sum: number
}

const counterparties = ['Студия «Лён»', 'ООО «Ромашка»', 'Типография «Строка»', 'Кафе «Глина»', 'Бюро «Чертёж»']

const operations: Operation[] = Array.from({ length: 5000 }, (_, index) => ({
  id: 5000 - index,
  date: `${(index % 28) + 1} окт`,
  counterparty: counterparties[index % counterparties.length]!,
  sum: 1_200 + ((index * 7_919) % 98_000),
}))

const operationColumns: GrDataColumn<Operation>[] = [
  { key: 'id', label: '№', width: 90, sortable: true },
  { key: 'date', label: 'Дата', width: 100 },
  { key: 'counterparty', label: 'Контрагент', width: 220 },
  { key: 'sum', label: 'Сумма', width: 140, align: 'right', sortable: true },
]

type Shipment = {
  id: string
  client: string
  sum: number
  lines: string[]
}

const shipments: Shipment[] = [
  { id: 'СЧ-1046', client: 'Студия «Лён»', sum: 48_000, lines: ['Фирменный стиль · 36 000 ₽', 'Вёрстка презентации × 2 · 12 000 ₽'] },
  { id: 'СЧ-1044', client: 'Иван Петров', sum: 7_900, lines: ['Консультация, 2 часа · 7 900 ₽'] },
  { id: 'СЧ-1043', client: 'Типография «Строка»', sum: 132_500, lines: ['Тираж каталога · 118 000 ₽', 'Доставка · 14 500 ₽'] },
]

const shipmentColumns: GrDataColumn<Shipment>[] = [
  { key: 'id', label: 'Счёт' },
  { key: 'client', label: 'Клиент' },
  { key: 'sum', label: 'Сумма', align: 'right' },
]

// Первая попытка у СЧ-1044 падает намеренно: так видно состояние отказа и кнопку повтора.
const failedOnce = new Set<string>()

function loadLines(row: Shipment, signal: AbortSignal): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (row.id === 'СЧ-1044' && !failedOnce.has(row.id)) {
        failedOnce.add(row.id)
        reject(new Error('Сервис счетов не ответил'))
        return
      }
      resolve(row.lines)
    }, 900)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason)
    }, { once: true })
  })
}

const orderRows: Order[] = [
  { id: 'order-42', title: 'Заказ 42 · Студия «Лён»', sum: 48_000 },
  { id: 'order-41', title: 'Заказ 41 · ООО «Ромашка»', sum: 12_400 },
  { id: 'order-40', title: 'Заказ 40 · Иван Петров', sum: 7_900 },
]

const orderActionColumns: GrDataColumn<Order>[] = [
  { key: 'title', label: 'Заказ' },
  { key: 'sum', label: 'Сумма', align: 'right' },
  { key: 'actions', label: 'Действия', align: 'right' },
]

const orderNotes: Record<string, string> = {
  'order-42': 'Макеты согласованы, ждём оплату второго этапа.',
  'order-41': 'Поддержка продлена до конца года.',
  'order-40': 'Клиент просил перенести созвон на пятницу.',
}

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
const detailClass = 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrDataTable
      v-model:selected="previewSelected"
      :rows="previewRows"
      :columns="previewColumns"
      row-key="no"
      initial-sort-key="sum"
      initial-sort-dir="desc"
      selectable
      size="xs"
      aria-label="Счета"
    >
      <template #cell-client="{ row }">
        <span class="whitespace-nowrap">{{ row.client }}</span>
      </template>
      <template #cell-sum="{ row }">
        <span class="whitespace-nowrap tabular-nums">{{ rub(row.sum) }}</span>
      </template>
    </GrDataTable>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen
      title="Счета"
      note="Сортировка по номеру и сумме, выбор строк (черновик не выбирается), раскрытие, итог и закреплённый номер при прокрутке."
      wide
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-baseline gap-2.5">
            <h5 :id="invoicesTitleId" class="text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">
              Счета
            </h5>
            <span :class="mutedClass">
              {{ selectedText }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2">
            <GrButton size="sm" variant="secondary" tone="neutral" :disabled="selectedInvoices.length === 0">
              Выгрузить
            </GrButton>
            <GrButton size="sm">
              Новый счёт
            </GrButton>
          </div>
        </div>

        <GrDataTable
          v-model:selected="selectedInvoices"
          v-model:expanded-keys="expandedInvoices"
          :rows="invoices"
          :columns="invoiceColumns"
          row-key="no"
          initial-sort-key="no"
          initial-sort-dir="desc"
          selectable
          :selectable-row="isSelectable"
          expandable
          :summary-row="invoicesSummary"
          :aria-labelledby="invoicesTitleId"
          region-label="Таблица счетов"
        >
          <template #cell-no="{ row }">
            <span class="whitespace-nowrap font-[var(--gr-font-mono)]">{{ row.no }}</span>
          </template>
          <template #cell-client="{ row }">
            <span class="whitespace-nowrap">{{ row.client }}</span>
          </template>
          <template #cell-status="{ row }">
            <GrBadge :tone="row.tone" size="sm">
              {{ row.status }}
            </GrBadge>
          </template>
          <template #cell-sum="{ row }">
            <span class="whitespace-nowrap tabular-nums">{{ rub(row.sum) }}</span>
          </template>
          <template #cell-due="{ row }">
            <span class="whitespace-nowrap text-[var(--gr-muted-fg)]">{{ row.due }}</span>
          </template>
          <template #cell-inn="{ row }">
            <span class="font-[var(--gr-font-mono)] text-[var(--gr-muted-fg)]">{{ row.inn }}</span>
          </template>
          <template #cell-manager="{ row }">
            <span class="whitespace-nowrap">{{ row.manager }}</span>
          </template>
          <template #summary-sum="{ value }">
            <span class="whitespace-nowrap tabular-nums">{{ rub(value) }}</span>
          </template>
          <template #detail="{ row }">
            <p :class="detailClass">
              {{ row.details }}
            </p>
          </template>
        </GrDataTable>

        <GrPagination v-model:page="invoicesPage" :page-size="6" :total="384" size="sm" show-total aria-label="Страницы счетов">
          <template #total="{ from, to, total }">
            Показано {{ from }}–{{ to }} из {{ total }}
          </template>
        </GrPagination>
      </div>
    </Specimen>

    <Specimen title="Загрузка и пусто" note="Пока едут строки — заглушка; под фильтром ничего — объяснение и выход." wide>
      <div class="grid items-start gap-4 md:grid-cols-2">
        <GrDataTable
          :rows="noOrders"
          :columns="orderColumns"
          loading
          loading-text="Загружаем заказы…"
          aria-label="Заказы студии, загрузка"
          size="sm"
        />
        <GrDataTable :rows="noOrders" :columns="orderColumns" aria-label="Заказы по фильтру" size="sm">
          <template #empty>
            <GrEmptyState
              kind="search"
              variant="ghost"
              size="sm"
              title="Заказов не нашлось"
              description="Под фильтр «Ромашка, сентябрь» ничего не подходит."
              :heading-level="5"
            >
              <GrButton size="sm" variant="secondary" tone="neutral">
                Сбросить фильтр
              </GrButton>
            </GrEmptyState>
          </template>
        </GrDataTable>
      </div>
    </Specimen>

    <Specimen title="Клавиатура по ячейкам" note="cell-navigation: одна остановка Tab, дальше стрелки; Home и End — к краям строки, Enter — внутрь ячейки, Esc — обратно." wide>
      <div class="flex flex-col gap-2">
        <GrDataTable :rows="people" :columns="peopleColumns" cell-navigation size="sm" aria-label="Сотрудники, навигация по ячейкам">
          <template #cell-actions="{ row }">
            <GrButton size="xs" variant="ghost" tone="neutral" @click="openedPerson = row.name">
              Открыть
            </GrButton>
          </template>
        </GrDataTable>
        <span :class="mutedClass" aria-live="polite">
          {{ openedPerson ? `Открыт профиль: ${openedPerson}` : 'Кнопка профиля — внутри ячейки, до неё ведёт Enter.' }}
        </span>
      </div>
    </Specimen>

    <Specimen
      title="Колонки настраивает пользователь"
      note="Порядок — за ручку в шапке (Shift+стрелки), ширина — за край заголовка, закрепление — из меню колонки; третий клик по заголовку снимает сортировку."
      wide
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span :class="mutedClass">Порядок: {{ orderText }}</span>
          <GrButton size="sm" variant="ghost" tone="neutral" :disabled="!isTuned" @click="resetColumns">
            Вернуть как было
          </GrButton>
        </div>
        <GrDataTable
          v-model:column-order="columnOrder"
          v-model:column-widths="columnWidths"
          v-model:pinned-columns="pinnedColumns"
          :rows="invoices"
          :columns="tunedColumns"
          row-key="no"
          reorderable-columns
          resizable-columns
          pinnable-columns
          sort-cycle="asc-desc-none"
          size="sm"
          aria-label="Счета с настройкой колонок"
          region-label="Счета с настройкой колонок"
        >
          <template #cell-no="{ row }">
            <span class="whitespace-nowrap font-[var(--gr-font-mono)]">{{ row.no }}</span>
          </template>
          <template #cell-client="{ row }">
            <span class="whitespace-nowrap">{{ row.client }}</span>
          </template>
          <template #cell-manager="{ row }">
            <span class="whitespace-nowrap">{{ row.manager }}</span>
          </template>
          <template #cell-sum="{ row }">
            <span class="whitespace-nowrap tabular-nums">{{ rub(row.sum) }}</span>
          </template>
        </GrDataTable>
      </div>
    </Specimen>

    <Specimen title="Пять тысяч строк" note="virtual, sticky-header и max-height: в DOM только окно, шапка на месте, диктору — aria-rowcount." wide>
      <GrDataTable
        :rows="operations"
        :columns="operationColumns"
        virtual
        sticky-header
        :max-height="320"
        size="sm"
        aria-label="Операции за октябрь"
        region-label="Операции за октябрь"
      >
        <template #cell-counterparty="{ row }">
          <span class="whitespace-nowrap">{{ row.counterparty }}</span>
        </template>
        <template #cell-sum="{ row }">
          <span class="whitespace-nowrap tabular-nums">{{ rub(row.sum) }}</span>
        </template>
      </GrDataTable>
    </Specimen>

    <Specimen title="Подгрузка при раскрытии" note="load-detail зовётся в момент раскрытия, свёрнутая строка свой запрос отменяет; у СЧ-1044 первая попытка падает." wide>
      <GrDataTable
        :rows="shipments"
        :columns="shipmentColumns"
        :load-detail="loadLines"
        expandable
        size="sm"
        aria-label="Счета с позициями"
      >
        <template #cell-sum="{ row }">
          <span class="whitespace-nowrap tabular-nums">{{ rub(row.sum) }}</span>
        </template>
        <template #detail="{ data }">
          <ul :class="detailClass">
            <li v-for="line in (data as string[])" :key="line">
              {{ line }}
            </li>
          </ul>
        </template>
      </GrDataTable>
    </Specimen>

    <Specimen title="Своя кнопка, одна раскрытая строка" note="expand-column=false: раскрытием управляет кнопка в своей колонке; accordion оставляет раскрытой одну строку." wide>
      <GrDataTable
        :rows="orderRows"
        :columns="orderActionColumns"
        expandable
        accordion
        :expand-column="false"
        size="sm"
        aria-label="Заказы с заметками"
      >
        <template #cell-sum="{ row }">
          <span class="whitespace-nowrap tabular-nums">{{ rub(row.sum) }}</span>
        </template>
        <template #cell-actions="{ expanded, toggleExpand }">
          <GrButton size="xs" variant="ghost" tone="neutral" :aria-expanded="expanded" @click="toggleExpand">
            {{ expanded ? 'Свернуть' : 'Заметка' }}
          </GrButton>
        </template>
        <template #detail="{ row }">
          <p :class="detailClass">
            {{ orderNotes[row.id] }}
          </p>
        </template>
      </GrDataTable>
    </Specimen>
  </div>
</template>
