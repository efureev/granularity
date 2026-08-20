<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'

/**
 * Свободные ключи: часть контракта заранее неизвестна.
 *
 * Витрине важно показать не кнопку «добавить», а то, что схема значения
 * соблюдается: `attributes` принимает строки, `limits` — целые числа с
 * границами, и правило ядра работает на них так же, как на объявленном поле.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    sku: { type: 'string', minLength: 3, title: 'Артикул', default: 'TS-100' },
    attributes: {
      type: 'object',
      title: 'Характеристики',
      description: 'Набор зависит от категории товара и приходит от контент-менеджера',
      properties: {},
      additionalProperties: { type: 'string', minLength: 2 },
    },
    limits: {
      type: 'object',
      title: 'Лимиты по площадкам',
      description: 'Площадки заводят по мере подключения',
      properties: {},
      additionalProperties: { type: 'integer', minimum: 1, maximum: 999 },
    },
  },
  required: ['sku'],
}

const ui: GrUiSchema = { layout: { columns: { base: 1 } } }

const model = ref<Record<string, unknown>>({
  sku: 'TS-100',
  attributes: { 'Материал': 'хлопок', 'Состав': '100% хлопок' },
  limits: { 'ozon': 10 },
})

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
      Имя ключа вводит пользователь, а <strong>значение рисуется по схеме</strong>: у характеристик
      это строка от двух символов, у лимитов — целое от 1 до 999, и степпер тут не потому, что так
      выбрали, а потому что так сказано в <code>additionalProperties</code>. Занятое имя не
      применяется: две строки с одним ключом писали бы поверх друг друга.
    </p>

    <p class="md:col-span-2 text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Пары рисуются <strong>хвостом объекта</strong>, а не полем среди полей: у них нет ни места в
      схеме, ни записи в <code>uiSchema</code>, ни порядка среди объявленных. И обратное:
      <code>additionalProperties: true</code> хвоста не даёт вовсе — ключи разрешены, но чем рисовать
      значение, схема не сказала, и выдумывать текстовое поле значит молча потерять тип.
    </p>
  </div>
</template>
