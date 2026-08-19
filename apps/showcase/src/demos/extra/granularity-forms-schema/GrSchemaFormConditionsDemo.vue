<script setup lang="ts">
import { ref } from 'vue'

import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'

/**
 * Форма, которая реагирует: состав полей зависит от уже введённого.
 *
 * Условие живёт в `uiSchema`, а не в схеме, и это не мелочь: контракт данных от
 * вида не зависит. Бэкенд по-прежнему знает, что у него есть и `inn`, и
 * `passport`, — а показывать их одновременно бессмысленно.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      enum: ['person', 'company'],
      // `x-enumNames` — расширение, которым OpenAPI-генераторы отдают подписи:
      // в самом `enum` лежат значения контракта, а не текст для человека.
      'x-enumNames': ['Физлицо', 'Компания'],
      title: 'Контрагент',
    },
    fullName: { type: 'string', minLength: 2, title: 'ФИО' },
    passport: { type: 'string', pattern: '^\\d{4} \\d{6}$', title: 'Паспорт' },
    companyName: { type: 'string', minLength: 2, title: 'Название' },
    inn: { type: 'string', pattern: '^\\d{10}$', title: 'ИНН' },
    vat: { type: 'boolean', title: 'Плательщик НДС' },
    vatRate: { type: 'integer', enum: [10, 20], title: 'Ставка НДС, %' },
    comment: { type: 'string', title: 'Комментарий' },
  },
  required: ['kind', 'fullName', 'passport'],
}

const ui: GrUiSchema = {
  layout: { columns: { base: 1, md: 2 } },
  fields: {
    // Равенство: самое частое условие.
    passport: { when: { path: 'kind', eq: 'person' } },
    companyName: { when: { path: 'kind', eq: 'company' } },
    inn: { when: { path: 'kind', eq: 'company' } },
    vat: { when: { path: 'kind', eq: 'company' } },
    // Составное: ставка нужна, только если это компания И она платит НДС.
    vatRate: { when: { all: [{ path: 'kind', eq: 'company' }, { path: 'vat', truthy: true }] } },
    comment: { span: 'full' },
  },
}

const model = ref<Record<string, unknown>>({ kind: 'person' })
</script>

<template>
  <div class="grid gap-3">
    <GrSchemaForm
      v-model="model"
      :schema="schema"
      :adapters="[jsonSchemaAdapter]"
      :ui-schema="ui"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Переключите контрагента: у физлица спрашивают паспорт, у компании — название и ИНН. Ставка НДС
      появляется только у компании, которая его платит: <code>all</code> складывает условия,
      <code>any</code> сложил бы их через «или». Внутри повторителя есть третий способ —
      относительный путь <code>../kind</code>: сослаться на соседа по строке абсолютным путём
      пришлось бы через индекс, а он меняется при каждом удалении.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Следствие, о котором стоит знать заранее: <strong>скрытое поле не проверяется</strong>.
      <code>passport</code> обязателен по схеме, но у компании его нет на экране — и форма
      отправится. Иначе пользователь упирался бы в ошибку на поле, которого не видит, и починить её
      было бы нечем.
    </p>
  </div>
</template>
