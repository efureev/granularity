<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrRichTextSize } from '@feugene/granularity-editor'

// `GrRichText`, `GrFormField`, `GrRadioGroup` подставляются авто-импортом.

/**
 * Поле с тулбаром и небольшой конструктор под ним.
 *
 * Панель модели тут не для красоты: значение — размеченный текст, и увидеть, что
 * именно уходит наружу, иначе нельзя. Переключатель `output` меняет **форму**
 * этого значения, и разница видна в той же панели.
 */
const value = ref<string | Record<string, unknown>>('<p>Наберите текст и примените <strong>формат</strong>.</p>')

const size = ref<GrRichTextSize>('md')
const toolbar = ref<'true' | 'false' | 'bubble' | 'both'>('true')
const output = ref<'html' | 'json'>('html')

const sizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' },
] satisfies Array<{ value: GrRichTextSize, label: string }>

const toolbarOptions = [
  { value: 'true', label: 'Панель' },
  { value: 'bubble', label: 'Пузырёк' },
  { value: 'both', label: 'Оба' },
  { value: 'false', label: 'Нет' },
] satisfies Array<{ value: 'true' | 'false' | 'bubble' | 'both', label: string }>

const outputOptions = [
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
] satisfies Array<{ value: 'html' | 'json', label: string }>

/** `toolbar` принимает и булево, и строку — радиогруппа отдаёт только строки. */
const toolbarProp = computed(() => {
  if (toolbar.value === 'true') return true
  if (toolbar.value === 'false') return false

  return toolbar.value
})

const model = computed(() => (typeof value.value === 'string'
  ? value.value
  : JSON.stringify(value.value, null, 2)))

/**
 * Форма значения меняется вместе с `output`: старое значение остаётся в прежнем
 * виде до первой правки, и компонент об этом честно предупреждает в консоли.
 * Поэтому переключатель сразу приводит модель к новой форме.
 */
function onOutputChange(next: 'html' | 'json'): void {
  output.value = next
  value.value = next === 'json'
    ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Наберите текст.' }] }] }
    : '<p>Наберите текст.</p>'
}
</script>

<template>
  <div class="grid gap-4">
    <GrRichText
      v-model="value"
      schema="article"
      :size="size"
      :toolbar="toolbarProp"
      :output="output"
      aria-label="Описание"
    />

    <div class="showcase-demo-panel grid gap-4 rounded-[var(--gr-radius-lg)] border p-4 sm:grid-cols-3">
      <GrFormField label="size">
        <GrRadioGroup v-model="size" :options="sizeOptions" variant="button" size="sm" />
      </GrFormField>

      <GrFormField label="toolbar">
        <GrRadioGroup v-model="toolbar" :options="toolbarOptions" variant="button" size="sm" />
      </GrFormField>

      <GrFormField label="output">
        <GrRadioGroup
          :model-value="output"
          :options="outputOptions"
          variant="button"
          size="sm"
          @update:model-value="onOutputChange($event as 'html' | 'json')"
        />
      </GrFormField>
    </div>

    <pre class="max-h-64 overflow-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] p-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)]">{{ model }}</pre>

    <p class="showcase-demo-text text-sm">
      <strong>output</strong> меняет форму значения, а не поведение: <code>html</code> отдаёт строку
      разметки, <code>json</code> — документ TipTap. В нативную форму значение уходит строкой в любом
      режиме: скрытое поле не умеет объектов.
    </p>

    <p class="showcase-demo-text text-sm">
      <strong>toolbar</strong> решает, где живут кнопки: панель сверху, пузырёк у выделения, оба или
      ничего. Выделите фрагмент в режиме «Пузырёк» — панель появится у самого текста. Горячие клавиши
      работают всегда: <strong>Ctrl/Cmd + B</strong> и <strong>I</strong>.
    </p>

    <p class="showcase-demo-text text-sm">
      Тулбар — одна остановка <strong>Tab</strong>, внутри ходят стрелками: у «статьи» десять кнопок,
      и без этого до самого текста пришлось бы добираться десятью нажатиями. Активный формат объявлен
      <code>aria-pressed</code>, а не только подсветкой — подсветки скринридер не видит.
    </p>
  </div>
</template>
