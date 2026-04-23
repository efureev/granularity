<script setup lang="ts">
import { DsCard } from '@feugene/granularity'

import InlineRichText from '../content/InlineRichText.vue'
import CodeBlock from './CodeBlock.vue'

defineProps<{
  title: string
  description: string
  status?: string
  code?: string
  note?: string
}>()
</script>

<template>
  <DsCard class="showcase-panel min-w-0 rounded-3xl border p-6">
    <div class="min-w-0 space-y-2">
      <h3 class="text-xl font-semibold">
        {{ title }}
      </h3>
      <p class="showcase-text-muted min-w-0 text-sm leading-6">
        <InlineRichText :text="description" />
      </p>
    </div>

    <div class="showcase-empty-state mt-5 min-w-0 overflow-hidden rounded-2xl border border-dashed px-4 py-6 text-sm">
      <slot name="preview">
        {{ $t('showcase.detailPage.preview.fallbackComponent') }}
      </slot>
    </div>

    <CodeBlock
      v-if="code"
      class="mt-5"
      :code="code"
      language="vue"
      :title="$t('showcase.detailPage.snippetTitle')"
    />

    <p
      v-if="note"
      class="showcase-text-subtle mt-4 min-w-0 text-sm leading-6"
    >
      <InlineRichText :text="note" />
    </p>
  </DsCard>
</template>