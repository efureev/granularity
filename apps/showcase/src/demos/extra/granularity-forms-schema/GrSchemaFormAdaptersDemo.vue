<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { z } from 'zod'

import { GrJsonViewer, GrSegmented } from '@feugene/granularity'
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import type { GrSchemaModel } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import { zodAdapter } from '@feugene/granularity-forms-schema/zod'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'

/**
 * Один и тот же контракт, записанный двумя способами.
 *
 * Переключатель меняет **источник**: слева уезжает то JSON Schema из OpenAPI, то
 * zod-объект из общего с бэкендом пакета. Нейтральная модель и сама форма при
 * этом не меняются — в этом и смысл слоя между схемой и виджетами.
 */
const jsonSchema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', title: 'Почта' },
    fullName: { type: 'string', minLength: 2, title: 'Имя' },
    age: { type: 'integer', minimum: 18, maximum: 120, title: 'Возраст' },
    role: { type: 'string', enum: ['admin', 'editor', 'viewer'], title: 'Роль' },
    newsletter: { type: 'boolean', title: 'Присылать письма' },
  },
  required: ['email', 'fullName', 'role'],
}

// Подпись поля — это `meta({ title })`, а не `describe()`: последнее ложится в
// описание под полем. И `meta` ставится **до** `optional()` — на обёртке она
// потерялась бы вместе с подписью.
const zodSchema = z.object({
  email: z.email().meta({ title: 'Почта' }),
  fullName: z.string().min(2).meta({ title: 'Имя' }),
  age: z.number().int().min(18).max(120).meta({ title: 'Возраст' }).optional(),
  role: z.enum(['admin', 'editor', 'viewer']).meta({ title: 'Роль' }),
  newsletter: z.boolean().meta({ title: 'Присылать письма' }).optional(),
})

const ui: GrUiSchema = {
  layout: { columns: { base: 1, md: 2 } },
  fields: { newsletter: { span: 'full' } },
}

const source = ref<'json' | 'zod'>('json')
const pane = ref<'schema' | 'model' | 'value'>('schema')

const model = ref<Record<string, unknown>>({})

// Нейтральная модель приезжает событием: считать её самому незачем — форма уже
// разобрала схему и отдаёт ровно то, по чему рисует.
const parsed = shallowRef<GrSchemaModel | null>(null)

const schema = computed(() => (source.value === 'json' ? jsonSchema : zodSchema))

const shown = computed(() => {
  if (pane.value === 'schema')
    return source.value === 'json' ? jsonSchema : '(zod-объект — код, а не данные; см. исходник демо)'

  return pane.value === 'model' ? parsed.value : model.value
})

const paneHint: Record<typeof pane.value, string> = {
  schema: 'Источник. Переключите адаптер — здесь поменяется всё, а форма справа останется прежней.',
  model: 'Нейтральная модель: узлы, типы, ограничения. У обоих адаптеров она одинаковая — по ней и рисуется форма.',
  value: 'Текущее значение `v-model`. Обновляется на каждое нажатие клавиши.',
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Схема приходит от бэкенда — формой занимается пакет
      </span>

      <GrSegmented
        v-model="source"
        size="sm"
        :options="[
          { value: 'json', label: 'JSON Schema' },
          { value: 'zod', label: 'zod' },
        ]"
        aria-label="Источник схемы"
      />
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <GrSchemaForm
        v-model="model"
        :schema="schema"
        :adapters="[jsonSchemaAdapter, zodAdapter]"
        :ui-schema="ui"
        @parsed="value => (parsed = value)"
      />

      <div class="grid content-start gap-2">
        <GrSegmented
          v-model="pane"
          size="sm"
          :options="[
            { value: 'schema', label: 'Схема' },
            { value: 'model', label: 'Модель' },
            { value: 'value', label: 'Значение' },
          ]"
          aria-label="Что показать"
        />

        <GrJsonViewer
          :value="shown"
          :default-expand-depth="3"
          :max-height="320"
          size="sm"
          :aria-label="`Панель: ${pane}`"
        />

        <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
          {{ paneHint[pane] }}
        </span>
      </div>
    </div>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Адаптер выбирается сам — по <code>supports()</code>, а не по пропу: в <code>adapters</code>
      переданы оба, и каждый узнаёт свою схему. Поэтому приложение, у которого часть форм из
      OpenAPI, а часть из общего с бэкендом zod-пакета, не разделяется на две ветки кода.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Вкладка <strong>«Модель»</strong> — то, чего обычно не показывают: разобранный контракт, по
      которому уже нет разницы, откуда он пришёл. Именно на него смотрит реестр рендереров, выбирая
      контрол, и компилятор правил, собирая валидацию. Узлы, их типы, форматы и обязательность у
      обоих адаптеров совпадают — различается только поле <code>adapter</code>, которое помнит, кто
      разбирал.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Две тонкости на стороне zod, которые видно в исходнике демо. Подпись поля — это
      <code>meta({ title })</code>, а не <code>describe()</code>: второе ложится в описание под
      полем. И <code>meta</code> ставится <strong>до</strong> <code>optional()</code> — на обёртке
      подпись теряется.
    </p>
  </div>
</template>
