<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrSegmented } from '@feugene/granularity'
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter } from '@feugene/granularity-forms-schema/json-schema'
import type { JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import { chronoRenderers } from '@feugene/granularity-forms-schema/renderers/chrono'

/**
 * Наборы рендереров подключаются **явно**, и это осознанно.
 *
 * Возьми пакет календарь сам — и приложение, которому нужны две строки и дата,
 * получило бы в бандл `granularity-chrono` целиком, ни разу об этом не попросив.
 * Поэтому по умолчанию `format: date` — нативный `input[type=date]`, а панель
 * появляется, когда набор передали в проп `renderers`.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    title: { type: 'string', title: 'Событие' },
    day: { type: 'string', format: 'date', title: 'Дата' },
    at: { type: 'string', format: 'time', title: 'Время' },
    createdAt: { type: 'string', format: 'date-time', title: 'Создано' },
  },
  required: ['title', 'day'],
}

const set = ref<'core' | 'chrono'>('core')
const renderers = computed(() => (set.value === 'chrono' ? chronoRenderers : undefined))

const model = ref<Record<string, unknown>>({ title: 'Ревью квартала' })
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Схема не менялась — менялся набор рендереров
      </span>

      <GrSegmented
        v-model="set"
        size="sm"
        :options="[
          { value: 'core', label: 'Только ядро' },
          { value: 'chrono', label: '+ chrono' },
        ]"
        aria-label="Набор рендереров"
      />
    </div>

    <GrSchemaForm
      :key="set"
      v-model="model"
      :schema="schema"
      :adapters="[jsonSchemaAdapter]"
      :renderers="renderers"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Слева от переключателя ничего не поменялось: та же схема, те же три поля с форматами
      <code>date</code>, <code>time</code> и <code>date-time</code>. Разница только в реестре —
      и вместо нативных полей появляются <code>GrDatePicker</code>, <code>GrTimePicker</code> и
      <code>GrDateTimePicker</code> со своей клавиатурой, панелью и локалью.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Записи из <code>renderers</code> кладутся <strong>поверх</strong> дефолтных и по умолчанию
      сильнее: потребитель регистрирует их последними и вправе ждать, что победят они. Тем же
      способом подключается <code>./renderers/extended</code> и любой свой виджет.
    </p>
  </div>
</template>
