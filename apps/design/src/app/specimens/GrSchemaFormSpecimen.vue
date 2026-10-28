<script setup lang="ts">
import type { GrUiSchema } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import { ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const ADAPTERS = [jsonSchemaAdapter]

const previewSchema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    firstName: { type: 'string', title: 'Имя' },
    lastName: { type: 'string', title: 'Фамилия' },
  },
  required: ['firstName'],
}
const previewUi: GrUiSchema = { layout: { columns: 2 } }
const previewModel = ref<Record<string, unknown>>({ firstName: 'Анна', lastName: 'Ершова' })

/** Схема, какой её отдаёт OpenAPI: типы, форматы и ограничения — ни слова о виде. */
const settingsSchema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    company: { type: 'string', minLength: 2, title: 'Название' },
    inn: { type: 'string', pattern: '^\\d{10}$', title: 'ИНН', description: '10 цифр — для юрлица' },
    email: { type: 'string', format: 'email', title: 'Почта для счетов' },
    timezone: {
      'type': 'string',
      'enum': ['Europe/Kaliningrad', 'Europe/Moscow', 'Europe/Samara', 'Asia/Yekaterinburg', 'Asia/Novosibirsk', 'Asia/Vladivostok'],
      'x-enumNames': ['Калининград', 'Москва', 'Самара', 'Екатеринбург', 'Новосибирск', 'Владивосток'],
      'title': 'Часовой пояс',
    },
    currency: {
      'type': 'string',
      'enum': ['RUB', 'USD', 'EUR'],
      'x-enumNames': ['Рубль', 'Доллар', 'Евро'],
      'title': 'Валюта счетов',
    },
    paymentDays: { type: 'integer', minimum: 1, maximum: 90, title: 'Срок оплаты, дней' },
    vat: { type: 'boolean', title: 'Плательщик НДС' },
    vatRate: { 'type': 'integer', 'enum': [10, 20], 'x-enumNames': ['10 %', '20 %'], 'title': 'Ставка НДС' },
    tags: { type: 'array', items: { type: 'string' }, title: 'Метки клиентов' },
    signature: { type: 'string', maxLength: 500, title: 'Подпись в письмах' },
  },
  required: ['company', 'email', 'currency'],
}

const settingsUi: GrUiSchema = {
  layout: {
    columns: { base: 1, md: 2 },
    sections: [
      { id: 'company', title: 'Организация', description: 'Реквизиты попадут в каждый счёт.', fields: ['company', 'inn', 'email', 'timezone'] },
      { id: 'billing', title: 'Счета', fields: ['currency', 'paymentDays', 'vat', 'vatRate', '*'] },
    ],
  },
  fields: {
    currency: { span: 'full', controlProps: { orientation: 'horizontal' } },
    vatRate: { when: { path: 'vat', truthy: true }, controlProps: { orientation: 'horizontal' } },
    tags: { span: 'full', hint: 'Enter добавляет метку' },
    signature: { span: 'full' },
  },
}

const settings = ref<Record<string, unknown>>({
  company: 'Студия «Лён»',
  inn: '7704123456',
  email: 'billing@len.studio',
  timezone: 'Europe/Moscow',
  currency: 'RUB',
  paymentDays: 10,
  vat: true,
  vatRate: 20,
  tags: ['опт', 'постоянный'],
  signature: 'С уважением, бухгалтерия студии «Лён».',
})
const savedNote = ref('')

const orderSchema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', title: 'Почта' },
    company: { type: 'string', title: 'Компания' },
    items: {
      type: 'array',
      title: 'Позиции',
      items: {
        type: 'object',
        properties: {
          sku: { type: 'string', title: 'Артикул' },
          qty: { type: 'integer', minimum: 1, title: 'Количество' },
        },
        required: ['sku', 'qty'],
      },
    },
  },
  required: ['email'],
}
const orderUi: GrUiSchema = {
  layout: { columns: { base: 1, md: 2 } },
  fields: { items: { span: 'full', array: { columns: { base: 1, md: 2 }, addLabel: 'Добавить позицию' } } },
}
const order = ref<Record<string, unknown>>({
  email: 'anna@len.studio',
  company: 'Студия «Лён»',
  items: [{ sku: 'DS-01', qty: 2 }, { sku: 'DS-07', qty: 12 }],
})
/** Ответ 422 в формате Laravel: две ошибки садятся на свои поля, третьей поля нет — она уходит в сводку. */
const SERVER_ANSWER = {
  message: 'The given data was invalid.',
  errors: {
    'email': ['Почта уже закреплена за другим клиентом'],
    'items.1.qty': ['На складе осталось 3 штуки'],
    'promo': ['Промокод истёк вчера'],
  },
}

const deliverySchema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    delivery: {
      title: 'Доставка',
      properties: { comment: { type: 'string', title: 'Комментарий' } },
      oneOf: [
        {
          type: 'object',
          title: 'Самовывоз',
          properties: {
            kind: { const: 'pickup' },
            point: {
              'type': 'string',
              'enum': ['msk-sever', 'msk-yug', 'spb-centr'],
              'x-enumNames': ['Москва, Северный', 'Москва, Южный', 'Петербург, Центральный'],
              'title': 'Пункт выдачи',
            },
          },
          required: ['point'],
        },
        {
          type: 'object',
          title: 'Курьер',
          properties: {
            kind: { const: 'courier' },
            address: { type: 'string', minLength: 5, title: 'Адрес' },
            slot: {
              'type': 'string',
              'enum': ['10-14', '14-18', '18-22'],
              'x-enumNames': ['10:00 — 14:00', '14:00 — 18:00', '18:00 — 22:00'],
              'title': 'Интервал',
            },
          },
          required: ['address', 'slot'],
        },
      ],
    },
  },
}
const delivery = ref<Record<string, unknown>>({
  delivery: { kind: 'courier', address: 'Москва, ул. Лесная, 12', slot: '14-18', comment: 'Домофон не работает' },
})

const contactSchema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Контактное лицо' },
    phone: { type: 'string', format: 'tel', title: 'Телефон' },
    position: { type: 'string', title: 'Должность' },
  },
  required: ['name', 'phone'],
}
const contact = ref<Record<string, unknown>>({ name: 'Анна Ершова', phone: '+7 900 123-45-67', position: 'Бухгалтер' })

const requisitesSchema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    company: { type: 'string', title: 'Компания' },
    inn: { type: 'string', title: 'ИНН' },
    currency: { 'type': 'string', 'enum': ['RUB', 'USD'], 'x-enumNames': ['Рубль', 'Доллар'], 'title': 'Валюта' },
    edo: { type: 'boolean', title: 'Документы через ЭДО' },
  },
}
const readonlyRequisites = ref<Record<string, unknown>>({ company: 'Студия «Лён»', inn: '7704123456', currency: 'RUB', edo: true })
const disabledRequisites = ref<Record<string, unknown>>({ company: 'Студия «Лён»', inn: '7704123456', currency: 'RUB', edo: true })
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrSchemaForm v-model="previewModel" :schema="previewSchema" :adapters="ADAPTERS" :ui-schema="previewUi" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Форма из схемы" note="Поля дают контролы ядра по узлу схемы: почта, выбор до пяти вариантов — радио, больше — список, число, флажок, метки, длинный текст. Разделы, колонки и условие показа — в uiSchema." wide>
      <div class="max-w-[48rem] rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-6 shadow-[var(--gr-shadow-1)]">
        <GrSchemaForm
          v-model="settings"
          :schema="settingsSchema"
          :adapters="ADAPTERS"
          :ui-schema="settingsUi"
          :heading-level="5"
          @submit="savedNote = 'Настройки сохранены'"
          @invalid="savedNote = ''"
        >
          <template #actions>
            <div class="mt-6 flex flex-wrap items-center justify-end gap-3">
              <span role="status" class="me-auto text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">{{ savedNote }}</span>
              <GrButton type="submit">
                Сохранить
              </GrButton>
            </div>
          </template>
        </GrSchemaForm>
      </div>
    </Specimen>

    <Specimen title="Ответ сервера" note="422 разбирается сам: ошибка садится на своё поле, во вложенной строке тоже, и снимается первой правкой; сообщение без поля уходит в сводку над формой." wide>
      <div class="max-w-[48rem]">
        <GrSchemaForm v-model="order" :schema="orderSchema" :adapters="ADAPTERS" :ui-schema="orderUi" :server-errors="SERVER_ANSWER" />
      </div>
    </Specimen>

    <Specimen title="Ветвление" note="Набор полей зависит от одного ключа: переключатель вариантов вместо поля-дискриминатора; общий комментарий переживает смену ветки.">
      <GrSchemaForm v-model="delivery" :schema="deliverySchema" :adapters="ADAPTERS" :heading-level="5" />
    </Specimen>

    <Specimen title="Подписи слева" note="labelPosition=&quot;start&quot; — колонка подписей одной ширины для плотных карточек настроек.">
      <GrSchemaForm v-model="contact" :schema="contactSchema" :adapters="ADAPTERS" label-position="start" label-width="9rem" />
    </Specimen>

    <Specimen title="Состояния" note="readonly и disabled — на всю форму разом: значения видны, но не правятся; недоступная форма гасит и контролы." wide>
      <div class="grid gap-x-8 gap-y-6 md:grid-cols-2">
        <div class="flex flex-col gap-3">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrSchemaForm v-model="readonlyRequisites" :schema="requisitesSchema" :adapters="ADAPTERS" readonly />
        </div>
        <div class="flex flex-col gap-3">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrSchemaForm v-model="disabledRequisites" :schema="requisitesSchema" :adapters="ADAPTERS" disabled />
        </div>
      </div>
    </Specimen>
  </div>
</template>
