<script setup lang="ts">
import { ref } from 'vue'

import { GrCard } from '@feugene/granularity'
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'

// Массив объектов — то, ради чего генератор форм и заводят: руками повторяемая
// секция с добавлением, удалением и переиндексацией пишется дольше всего.
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    title: { type: 'string', title: 'Название заказа' },
    items: {
      type: 'array',
      title: 'Позиции',
      minItems: 1,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, title: 'Наименование' },
          qty: { type: 'integer', minimum: 1, title: 'Количество' },
          price: { type: 'number', minimum: 0, title: 'Цена' },
        },
        required: ['name', 'qty'],
      },
    },
  },
  required: ['title'],
}

const ui: GrUiSchema = {
  fields: {
    'items': { array: { columns: { base: 1, md: 3 }, addLabel: 'Добавить позицию' } },
    'items.*.name': { span: { base: 1, md: 1 } },
  },
}

const model = ref<Record<string, unknown>>({ items: [{ name: 'Кофе', qty: 2, price: 350 }] })
</script>

<template>
  <GrCard class="grid gap-4 p-5">
    <GrSchemaForm v-model="model" :schema="schema" :adapters="[jsonSchemaAdapter]" :ui-schema="ui" />
  </GrCard>
</template>
