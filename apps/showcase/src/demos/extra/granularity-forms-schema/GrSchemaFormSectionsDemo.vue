<script setup lang="ts">
import { ref } from 'vue'

import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'

/**
 * Двенадцать полей подряд — это анкета, которую бросают на середине.
 *
 * Схема их порядка не задаёт и задавать не должна: в JSON у объекта порядок
 * ключей формальный, а в zod — порядок объявления. Раскладка — работа
 * `uiSchema`, и она же переживает добавление поля на бэкенде: новое поле не
 * ломает разделы, а попадает в тот, где стоит `'*'`.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    lastName: { type: 'string', title: 'Фамилия' },
    firstName: { type: 'string', title: 'Имя' },
    birthday: { type: 'string', format: 'date', title: 'Дата рождения' },
    email: { type: 'string', format: 'email', title: 'Почта' },
    phone: { type: 'string', title: 'Телефон' },
    telegram: { type: 'string', title: 'Telegram' },
    country: { type: 'string', enum: ['RU', 'RS', 'AM', 'GE'], title: 'Страна' },
    city: { type: 'string', title: 'Город' },
    address: { type: 'string', title: 'Адрес' },
    position: { type: 'string', title: 'Должность' },
    department: { type: 'string', enum: ['Инженерия', 'Продукт', 'Продажи'], title: 'Отдел' },
    startedAt: { type: 'string', format: 'date', title: 'В компании с' },
  },
  required: ['lastName', 'firstName', 'email'],
}

const ui: GrUiSchema = {
  layout: {
    columns: { base: 1, md: 2 },
    sections: [
      {
        id: 'person',
        title: 'Личные данные',
        description: 'То, что не меняется от места работы.',
        fields: ['lastName', 'firstName', 'birthday'],
      },
      {
        id: 'contacts',
        title: 'Связь',
        fields: ['email', 'phone', 'telegram'],
      },
      {
        id: 'work',
        title: 'Работа',
        columns: { base: 1, md: 3 },
        // `'*'` — место для всего, что не перечислено выше. Новое поле в схеме
        // приедет сюда, а не потеряется.
        fields: ['position', 'department', 'startedAt', '*'],
      },
    ],
  },
  fields: { address: { span: 'full' } },
}

const model = ref<Record<string, unknown>>({})
</script>

<template>
  <div class="grid gap-3">
    <GrSchemaForm
      v-model="model"
      :schema="schema"
      :adapters="[jsonSchemaAdapter]"
      :ui-schema="ui"
      :heading-level="4"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Три раздела с заголовками и своей сеткой у каждого: «Работа» идёт в три колонки, остальные в
      две. Поля <code>country</code>, <code>city</code> и <code>address</code> нигде не перечислены —
      они попали в раздел со звёздочкой. Это не мелочь: бэкенд добавит поле, и оно окажется в форме
      само, а не выпадет из неё молча.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Заголовки — настоящие <code>h4</code> (уровень задаётся пропом <code>headingLevel</code>, чтобы
      встроиться в иерархию страницы), а не «жирный текст». Скринридер обходит форму по заголовкам,
      как обходит статью.
    </p>
  </div>
</template>
