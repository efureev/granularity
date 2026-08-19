<script setup lang="ts">
import { ref } from 'vue'

import { GrRating } from '@feugene/granularity'
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'

import SeverityField from './SeverityField.vue'

/**
 * «Почти всё сгенерировано, а два поля свои» — обещание, ради которого форму по
 * схеме вообще берут. Без такого выхода первое же нестандартное поле заставляет
 * бросить генерацию и написать всю форму руками.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    subject: { type: 'string', minLength: 3, title: 'Тема' },
    severity: { type: 'string', enum: ['low', 'normal', 'high'], title: 'Важность' },
    rating: { type: 'integer', minimum: 1, maximum: 5, title: 'Оценка поддержки' },
    details: { type: 'string', title: 'Подробности' },
  },
  required: ['subject', 'severity'],
}

const ui: GrUiSchema = {
  layout: { columns: { base: 1, md: 2 } },
  fields: {
    // Чужой компонент: реестр не зовётся вовсе.
    severity: { component: SeverityField },
    // Компонент ядра на месте числового поля — тот же способ, готовая деталь.
    rating: { component: GrRating, controlProps: { max: 5 } },
    details: { span: 'full', widget: 'gr:textarea' },
  },
}

const model = ref<Record<string, unknown>>({ severity: 'normal' })
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
      Три поля из четырёх подменены, и все три — разными способами.
      «Важность» рисует <strong>свой</strong> компонент (<code>SeverityField.vue</code> рядом в
      исходнике): по схеме это <code>enum</code>, то есть был бы селект. «Оценка» — готовый
      <code>GrRating</code> из ядра там, где схема обещала числовое поле. «Подробности» — запись
      реестра по имени (<code>widget: 'gr:textarea'</code>), когда менять компонент не нужно, а
      нужен другой из набора.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Своему контролу хватает контракта форм-контрола ядра: принять
      <code>modelValue</code>, отдать <code>update:modelValue</code>, уважать
      <code>disabled</code>/<code>readonly</code> и уметь показать себя ошибочным. Подпись,
      звёздочку обязательности, вывод ошибки и связь по <code>aria-describedby</code> берёт на себя
      обёртка поля — их писать не надо, и разойтись с остальной формой они не могут.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Виджет ищется по порядку: сначала слот поля, затем <code>component</code>, затем
      <code>widget</code> по имени, затем записи реестра по убыванию приоритета и в самом конце —
      <code>gr:string</code> вместе с событием <code>unresolved</code>. Последнее не тихий откат:
      форма сообщает, что узел она не поняла.
    </p>
  </div>
</template>
