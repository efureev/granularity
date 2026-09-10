<script setup lang="ts">
import { computed, ref } from 'vue'

import { markdownFromEditorDocument } from '@feugene/granularity-editor/markdown'
import type { GrEditorNode } from '@feugene/granularity-editor/markdown'

// `GrRichText`, `GrMarkdown`, `GrFormField`, `GrRadioGroup` подставляются авто-импортом.

/**
 * Обратная дорога: правят в редакторе, наружу уходит markdown.
 *
 * Лексер так не умеет — он парсер и работает в одну сторону. Обратно документ
 * переводит `markdownFromEditorDocument`: она ходит по обычному JSON редактора
 * и `@tiptap/*` не импортирует, поэтому проверяется без поднятия ProseMirror.
 */
const value = ref<Record<string, unknown> | string | null>({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Правьте меня' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Выделите слово и нажмите ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'жирный' },
        { type: 'text', text: ' — справа появятся звёздочки.' },
      ],
    },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'пункт списка' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'и ещё один' }] }] },
      ],
    },
  ],
})

const format = ref<'markdown' | 'json'>('markdown')

const formatOptions = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
]

// `GrRichText` типизует значение как `string | Record | null` — в режиме
// `output="json"` там всегда документ, но тип об этом не знает.
const markdown = computed(() => markdownFromEditorDocument(value.value as unknown as GrEditorNode))
const output = computed(() => (format.value === 'markdown'
  ? markdown.value
  : JSON.stringify(value.value, null, 2)))
</script>

<template>
  <div class="grid gap-5">
    <div class="grid gap-3 rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-muted)] p-4">
      <GrFormField label="Что уходит наружу">
        <GrRadioGroup v-model="format" :options="formatOptions" variant="button" size="sm" />
      </GrFormField>

      <p class="showcase-demo-text text-xs">
        `JSON` — родная форма документа TipTap, её отдаёт сам редактор.
        `Markdown` собирает `markdownFromEditorDocument` из слоя `./markdown`:
        парсер работает в одну сторону, и обратная дорога — отдельная функция.
      </p>
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <div class="grid content-start gap-2">
        <span class="showcase-demo-caption text-[11px]">Редактор</span>
        <GrRichText v-model="value" output="json" schema="article" aria-label="Документ редактора" />
      </div>

      <div class="grid content-start gap-2">
        <span class="showcase-demo-caption text-[11px]">
          {{ format === 'markdown' ? 'Готовый markdown' : 'Документ редактора' }}
        </span>

        <pre
          class="max-h-[22rem] overflow-auto rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-card)] p-4 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-sm)] shadow-[var(--showcase-shadow-raised)]"
          tabindex="0"
        >{{ output }}</pre>
      </div>
    </div>

    <div class="grid content-start gap-2">
      <span class="showcase-demo-caption text-[11px]">Этот markdown, показанный GrMarkdown</span>
      <div class="overflow-hidden rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-card)] px-5 py-5 shadow-[var(--showcase-shadow-raised)]">
        <GrMarkdown :source="markdown" id-prefix="roundtrip-" />
      </div>
    </div>
  </div>
</template>
