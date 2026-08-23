<script setup lang="ts">
import { ref, watchEffect } from 'vue'

import { GrCard } from '@feugene/granularity'

import { resolveDemoSource } from '../../demos/registry'
import InlineRichText from '../content/InlineRichText.vue'
import CodeBlock from './CodeBlock.vue'

const props = defineProps<{
  title: string
  description: string
  status?: string
  /** Готовый сниппет — для примеров, у которых демо-файла нет (доки пакетов, Foundations). */
  code?: string
  /** Ключ демо: сниппет читается из того же файла, что рисует превью. */
  previewKey?: string
  /** Демо печатает свой сниппет само (конструкторы) — второй блок не нужен. */
  hideCode?: boolean
  note?: string
}>()

const snippet = ref<string | undefined>(props.code)

watchEffect(async () => {
  snippet.value = props.hideCode ? undefined : props.code ?? await resolveDemoSource(props.previewKey)
})
</script>

<template>
  <GrCard class="showcase-panel min-w-0 rounded-3xl border p-6">
    <div class="min-w-0 space-y-2">
      <h3 class="text-xl font-semibold">
        {{ title }}
      </h3>
      <p class="showcase-text-muted min-w-0 text-sm leading-6">
        <InlineRichText :text="description" />
      </p>
    </div>

    <div
      data-example-preview
      class="showcase-empty-state mt-5 min-w-0 overflow-hidden rounded-2xl border border-dashed px-4 py-6 text-sm"
    >
      <slot name="preview">
        {{ $t('showcase.detailPage.preview.fallbackComponent') }}
      </slot>
    </div>

    <CodeBlock
      v-if="snippet"
      class="mt-5"
      :code="snippet"
      language="vue"
    />

    <p
      v-if="note"
      class="showcase-text-subtle mt-4 min-w-0 text-sm leading-6"
    >
      <InlineRichText :text="note" />
    </p>
  </GrCard>
</template>
