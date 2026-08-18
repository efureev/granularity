<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCard } from '@feugene/granularity'
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'

// Схема, какой её отдаёт OpenAPI: типы, форматы, ограничения — и ни слова о виде.
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', title: 'Почта' },
    fullName: { type: 'string', minLength: 2, title: 'Имя' },
    age: { type: 'integer', minimum: 18, maximum: 120, title: 'Возраст' },
    role: { type: 'string', enum: ['admin', 'editor', 'viewer'], title: 'Роль' },
    about: { type: 'string', maxLength: 500, title: 'О себе' },
    newsletter: { type: 'boolean', title: 'Присылать письма' },
  },
  required: ['email', 'fullName', 'role'],
}

// Всё, что относится к виду, живёт отдельно от контракта данных.
const ui: GrUiSchema = {
  layout: { columns: { base: 1, md: 2 } },
  fields: {
    about: { span: 'full' },
    newsletter: { span: 'full' },
  },
}

const model = ref<Record<string, unknown>>({})
const saved = ref('—')

function onSubmit(value: Record<string, unknown>): void {
  saved.value = JSON.stringify(value)
}
</script>

<template>
  <GrCard class="grid gap-4 p-5">
    <GrSchemaForm
      v-model="model"
      :schema="schema"
      :adapters="[jsonSchemaAdapter]"
      :ui-schema="ui"
      @submit="onSubmit"
    >
      <template #actions>
        <div class="mt-4 flex justify-end">
          <GrButton type="submit">
            Сохранить
          </GrButton>
        </div>
      </template>
    </GrSchemaForm>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Отправлено: <strong>{{ saved }}</strong>
    </p>
  </GrCard>
</template>
