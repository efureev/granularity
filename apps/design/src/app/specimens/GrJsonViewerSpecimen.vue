<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import type { GrJsonViewerInstance } from '@feugene/granularity/components/GrJsonViewer'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const previewValue = {
  id: 'СЧ-1046',
  amount: 48000,
  paid: true,
}

const invoiceResponse = {
  id: 'СЧ-1046',
  status: 'paid',
  client: {
    name: 'Студия «Лён»',
    inn: '7704123456',
    email: 'hello@len.studio',
  },
  amount: {
    value: 48000,
    vat: 8000,
    currency: 'RUB',
  },
  items: [
    { sku: 'DS-01', title: 'Фирменный стиль', qty: 1, price: 36000 },
    { sku: 'DS-07', title: 'Вёрстка презентации', qty: 2, price: 6000 },
  ],
  paidAt: '2026-10-24T10:42:00+03:00',
  overdue: false,
  comment: null,
}

const modelRequest = {
  model: 'vision-large',
  prompt: 'Опиши, что на скане счёта: поставщик, сумма, срок оплаты.',
  image: `data:image/png;base64,${'iVBORw0KGgoAAAANSUhEUgAA'.repeat(40)}`,
  events: Array.from({ length: 24 }, (_, index) => ({ at: `10:${String(index).padStart(2, '0')}`, type: index % 3 === 0 ? 'retry' : 'chunk' })),
}

const webhookQuery = ref('')
const webhook = {
  event: 'payment.succeeded',
  delivery: { attempt: 2, endpoint: 'https://api.example.ru/hooks/pay', status: 200 },
  payment: { id: 'pay_8Kq2', amount: 12400, method: 'sbp', payer: { name: 'ООО «Ромашка»', inn: '5009087654' } },
  meta: { requestId: 'req_01HXQZ7C4M2V8KJ3T9', receivedAt: '2026-10-26T09:15:03+03:00' },
}
const viewer = useTemplateRef<GrJsonViewerInstance>('webhookViewer')

watch(webhookQuery, query => viewer.value?.filter(query))

type Unit = { name: string, children: Unit[], parent?: Unit }

const root: Unit = { name: 'Финансы', children: [] }
const team: Unit = { name: 'Бухгалтерия', children: [], parent: root }
root.children.push(team)
const owner = { name: 'Анна Соколова', role: 'владелец' }
const graph = {
  department: root,
  reviewers: [owner, owner],
}

const operations = Array.from({ length: 400 }, (_, index) => ({
  id: 10_000 + index,
  kind: index % 5 === 0 ? 'refund' : 'payment',
  amount: 900 + ((index * 3_710) % 48_000),
  settled: index % 4 !== 0,
}))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrJsonViewer :value="previewValue" :searchable="false" :copyable="false" size="sm" aria-label="Ответ API: счёт" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Ответ API" note="GET /api/invoices/СЧ-1046 · 200 — ключи, строки, числа, булевы и null разным цветом; поиск по ключу и значению, копирование узла по наведению.">
      <GrJsonViewer :value="invoiceResponse" :default-expand-depth="2" aria-label="Ответ API: счёт СЧ-1046" />
    </Specimen>

    <Specimen title="Длинные значения" note="Строка обрезается в показе, массив обрывается «ещё N»; в буфер уходит полное значение.">
      <GrJsonViewer
        :value="modelRequest"
        :default-expand-depth="2"
        :max-string-length="48"
        :max-array-items="4"
        :searchable="false"
        aria-label="Запрос к модели распознавания"
      />
    </Specimen>

    <Specimen title="Своя строка поиска" note="Панель выключена: поиск идёт через filter() из defineExpose, раскрытие — через expandAll() и collapseAll().">
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <GrInput v-model="webhookQuery" type="search" placeholder="inn, sbp, 200…" aria-label="Найти в вебхуке" class="min-w-0 flex-1" />
          <GrButton variant="secondary" tone="neutral" @click="viewer?.expandAll()">
            Раскрыть
          </GrButton>
          <GrButton variant="ghost" tone="neutral" @click="viewer?.collapseAll()">
            Свернуть
          </GrButton>
        </div>
        <GrJsonViewer ref="webhookViewer" :value="webhook" :searchable="false" aria-label="Тело вебхука payment.succeeded" />
      </div>
    </Specimen>

    <Specimen title="Цикл и повтор" note="[Circular] — только у настоящего предка по цепочке; объект, положенный в данные дважды, рисуется дважды.">
      <GrJsonViewer :value="graph" :default-expand-depth="4" :searchable="false" aria-label="Структура отдела со ссылкой на родителя" />
    </Specimen>

    <Specimen title="Четыреста операций" note="virtual и max-height: дерево держит в DOM только окно строк вокруг видимого." wide>
      <GrJsonViewer
        :value="operations"
        :default-expand-depth="1"
        virtual
        :max-height="320"
        root-label="operations"
        aria-label="Выгрузка операций за октябрь"
      />
    </Specimen>
  </div>
</template>
