<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  GrFormField,
  GrRadioGroup,
  GrSwitch,
  GrTransfer,
  type GrComponentSize,
} from '@feugene/granularity'

import CodeBlock from '../../../components/doc/CodeBlock.vue'

const size = ref<GrComponentSize>('md')
const searchable = ref(true)
const sortable = ref(true)
const draggable = ref(true)
const disabled = ref(false)
const readonly = ref(false)

const model = ref<string[]>(['amount'])
const events = ref<string[]>([])

const sizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' },
] satisfies Array<{ value: GrComponentSize, label: string }>

const fields = [
  { id: 'date', label: 'Дата' },
  { id: 'number', label: 'Номер' },
  { id: 'counterparty', label: 'Контрагент' },
  { id: 'amount', label: 'Сумма' },
  { id: 'status', label: 'Статус' },
  { id: 'manager', label: 'Менеджер' },
]

function onTransfer(keys: Array<string | number>, direction: string): void {
  events.value = [`transfer: ${keys.join(', ')} в ${direction}`, ...events.value].slice(0, 4)
}

function onSearch(query: string, side: string): void {
  if (query !== '')
    events.value = [`search: «${query}» в «${side}»`, ...events.value].slice(0, 4)
}

const previewCode = computed(() => {
  const attrs = [
    ':items="fields"',
    'v-model="columns"',
    'aria-label="Колонки отчёта"',
    size.value === 'md' ? null : `size="${size.value}"`,
    searchable.value ? null : ':searchable="false"',
    sortable.value ? null : ':sortable="false"',
    draggable.value ? null : ':draggable="false"',
    disabled.value ? 'disabled' : null,
    readonly.value ? 'readonly' : null,
    '@transfer="onTransfer"',
  ].filter(Boolean)

  return `<GrTransfer\n  ${attrs.join('\n  ')}\n/>`
})
</script>

<template>
  <!--
    Настройки под превью, а не сбоку: двум панелям с колонкой кнопок между ними
    нужна ширина, и в узкой колонке заголовки панелей начинают обрезаться.
  -->
  <div class="grid gap-4">
    <div class="rounded-[24px] border border-dashed border-[var(--preview-brd)] bg-[image:var(--preview-surface)] p-6">
      <GrTransfer
        v-model="model"
        :items="fields"
        :size="size"
        :searchable="searchable"
        :sortable="sortable"
        :draggable="draggable"
        :disabled="disabled"
        :readonly="readonly"
        source-title="Доступные поля"
        target-title="Колонки отчёта"
        aria-label="Колонки отчёта"
        @transfer="onTransfer"
        @search="onSearch"
      />

      <p class="showcase-demo-text mt-4 text-sm">
        Значение — <code>{{ JSON.stringify(model) }}</code>
      </p>
    </div>

    <div class="showcase-demo-panel grid gap-4 rounded-[28px] border p-4 lg:p-5">
      <div class="showcase-demo-title text-sm font-semibold">
        Properties
      </div>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <GrFormField label="Размер">
          <GrRadioGroup v-model="size" :options="sizeOptions" variant="button" size="sm" />
        </GrFormField>

        <GrSwitch v-model="searchable">
          Поиск в панелях
        </GrSwitch>
        <GrSwitch v-model="sortable">
          Перестановка справа
        </GrSwitch>
        <GrSwitch v-model="draggable">
          Перетаскивание
        </GrSwitch>
        <GrSwitch v-model="readonly">
          Только чтение
        </GrSwitch>
        <GrSwitch v-model="disabled">
          Выключено
        </GrSwitch>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <CodeBlock :code="previewCode" language="vue" expanded title="Rendered snippet" />

      <div class="showcase-demo-panel min-h-[120px] rounded-[28px] border p-4 lg:p-5">
        <p class="showcase-demo-title text-sm font-semibold">
          События компонента
        </p>
        <p
          v-for="(line, index) in events"
          :key="index"
          class="mt-1 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] [font-variant-numeric:tabular-nums]"
        >
          {{ line }}
        </p>
        <p v-if="events.length === 0" class="showcase-demo-text mt-1 text-sm">
          Перенесите строку или наберите запрос в поиске
        </p>
      </div>
    </div>
  </div>
</template>
