<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrJsonViewer, GrSegmented } from '@feugene/granularity'
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'

/**
 * Ответ сервера, разложенный по полям.
 *
 * Клиентская валидация проверяет форму, а не мир: занятость почты, лимит склада
 * и правила, живущие в базе, знает только бэкенд. Его ответ обязан вернуться на
 * те поля, из-за которых он и случился, — иначе пользователю остаётся общий
 * баннер «что-то пошло не так» над формой из двадцати полей.
 */
const schema: JsonSchemaDocument = {
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

const ui: GrUiSchema = { layout: { columns: { base: 1, md: 2 } }, fields: { items: { span: 'full' } } }

/** Три формата, и все живые. Пакет разбирает каждый без настройки. */
const responses = {
  laravel: {
    message: 'The given data was invalid.',
    errors: {
      'email': ['Почта уже занята'],
      'items.1.qty': ['На складе осталось 3 штуки'],
    },
  },
  jsonapi: {
    errors: [
      { source: { pointer: '/data/attributes/email' }, detail: 'Почта уже занята' },
      { source: { pointer: '/data/attributes/items/1/qty' }, detail: 'На складе осталось 3 штуки' },
      { detail: 'Заказ не прошёл проверку кредитного лимита' },
    ],
  },
  rfc7807: {
    type: 'https://example.com/validation-error',
    title: 'Validation Failed',
    violations: [
      { propertyPath: 'email', message: 'Почта уже занята' },
      { propertyPath: 'items[1].qty', message: 'На складе осталось 3 штуки' },
    ],
  },
} as const

const format = ref<keyof typeof responses>('laravel')
const answer = ref<unknown>(null)

const model = ref<Record<string, unknown>>({
  email: 'ivan@example.com',
  company: 'Ромашка',
  items: [{ sku: 'A-100', qty: 2 }, { sku: 'B-220', qty: 12 }],
})

const payload = computed(() => responses[format.value])

function send(): void {
  // Сервер ответил 422 — отдаём ответ как есть, разбирать его форме.
  answer.value = payload.value
}

function reset(): void {
  answer.value = null
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <GrSegmented
        v-model="format"
        size="sm"
        :options="[
          { value: 'laravel', label: 'Laravel' },
          { value: 'jsonapi', label: 'JSON:API' },
          { value: 'rfc7807', label: 'RFC 7807' },
        ]"
        aria-label="Формат ответа сервера"
        @update:model-value="reset"
      />

      <div class="flex gap-2">
        <GrButton size="sm" @click="send">
          Ответ 422
        </GrButton>
        <GrButton size="sm" variant="outline" :disabled="answer === null" @click="reset">
          Сбросить
        </GrButton>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <GrSchemaForm
        v-model="model"
        :schema="schema"
        :adapters="[jsonSchemaAdapter]"
        :ui-schema="ui"
        :server-errors="answer"
        show-form-errors
      />

      <div class="grid content-start gap-2">
        <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
          Что отдал сервер
        </span>
        <GrJsonViewer :value="payload" :default-expand-depth="4" :max-height="280" size="sm" aria-label="Ответ сервера" />
      </div>
    </div>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Три формата, и все три встречаются в жизни: Laravel отдаёт карту путей, JSON:API — указатели
      вида <code>/data/attributes/items/1/qty</code>, RFC 7807 — <code>items[1].qty</code>. Пакет
      приводит их к одному инстанс-пути сам, поэтому ошибка садится на <strong>вторую строку</strong>
      позиций, а не на форму целиком. Свой формат подключается пропом <code>serverErrors</code> уже
      готовой картой.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Сообщение, которому не нашлось поля, не пропадает: в ответе JSON:API третья ошибка без
      <code>source</code> — она уходит в сводку над формой. Потерять её было бы хуже всего:
      пользователь видел бы форму без единой пометки и кнопку, которая не срабатывает.
    </p>
  </div>
</template>
