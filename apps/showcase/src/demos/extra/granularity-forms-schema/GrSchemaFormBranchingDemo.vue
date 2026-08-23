<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'

/**
 * Ветвление: набор полей зависит от значения одного ключа.
 *
 * Демо намеренно даёт вариантам общее поле `comment` — на нём видно главное
 * решение: смена ветки сохраняет то, что есть у обеих сторон, и отбрасывает
 * чужое. Иначе пользователь терял бы уже написанное на каждом переключении.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    order: { type: 'string', title: 'Номер заказа', default: 'A-1043' },
    delivery: {
      title: 'Доставка',
      // Общая часть принадлежит каждой ветке: адаптер сливает её в вариант,
      // как `allOf`, — повторять поле во всех трёх не нужно.
      properties: { comment: { type: 'string', title: 'Комментарий курьеру или кладовщику' } },
      oneOf: [
        {
          type: 'object',
          title: 'Самовывоз',
          description: 'Заказ ждёт на складе трое суток',
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
          description: 'Привезём в выбранный интервал',
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
        {
          type: 'object',
          title: 'Почта',
          description: 'Отправим и пришлём трек-номер',
          properties: {
            kind: { const: 'post' },
            zip: { type: 'string', pattern: '^\\d{6}$', title: 'Индекс' },
            address: { type: 'string', minLength: 5, title: 'Адрес' },
          },
          required: ['zip', 'address'],
        },
      ],
    },
  },
  required: ['order'],
}

const ui: GrUiSchema = {
  layout: { columns: { base: 1, md: 2 } },
  fields: { 'delivery.comment': { span: 'full' } },
}

const model = ref<Record<string, unknown>>({})

const json = computed(() => JSON.stringify(model.value, null, 2))
</script>

<template>
  <div class="grid gap-3 md:grid-cols-2">
    <GrSchemaForm
      v-model="model"
      :schema="schema"
      :adapters="[jsonSchemaAdapter]"
      :ui-schema="ui"
    />

    <pre class="overflow-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] p-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)]">{{ json }}</pre>

    <p class="md:col-span-2 text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Переключите способ доставки и следите за панелью справа: в модели остаются
      <strong>ровно ключи выбранной ветки</strong>. Комментарий есть у всех трёх — он переживает
      переключение; адрес есть у курьера и почты — он тоже; пункт выдачи чужой для них обоих и
      отбрасывается. Оставить чужие ключи нельзя, схема на них ругнётся, а сбрасывать всё значит
      терять уже написанное.
    </p>

    <p class="md:col-span-2 text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Поля <code>kind</code> в форме нет, хотя в схеме оно есть у каждого варианта: это
      <strong>дискриминатор</strong>, и им управляет сам переключатель — второе поле с тем же именем
      спорило бы с ним за значение. Вариантов до пяти — переключатели, больше — список.
      Дискриминатор выводится тремя путями: <code>z.discriminatedUnion</code> в zod,
      <code>discriminator.propertyName</code> в OpenAPI и — как здесь — общий <code>const</code> у
      всех вариантов в чистой JSON Schema. Не вывелся ни одним — форма не гадает: узел уходит в
      полную проверку схемой с предупреждением в <code>model.warnings</code>.
    </p>
  </div>
</template>
