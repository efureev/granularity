<script setup lang="ts">
import { computed } from 'vue'

import { renderMarkdown } from '../docs'

const props = defineProps<{ source: string }>()

const html = computed(() => renderMarkdown(props.source))
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- источник — документ репозитория, собранный в бандл -->
  <div class="prose" v-html="html" />
</template>

<style scoped>
.prose {
  max-width: 960px;
  color: var(--gr-fg);
  font-size: var(--gr-text-sm);
  line-height: var(--gr-leading-base);
}

.prose :deep(p),
.prose :deep(ul),
.prose :deep(ol),
.prose :deep(table) {
  margin-block: 0 var(--gr-space-4);
}

.prose :deep(p),
.prose :deep(li) {
  max-width: 76ch;
}

.prose :deep(ul) {
  padding-inline-start: var(--gr-space-5);
  list-style: disc;
}

.prose :deep(li + li) {
  margin-block-start: var(--gr-space-1);
}

.prose :deep(strong) {
  font-weight: var(--gr-font-semibold);
}

.prose :deep(code) {
  padding: 0 4px;
  border-radius: var(--gr-radius-sm);
  background: var(--gr-muted);
  font-family: var(--gr-font-mono);
  font-size: 0.9em;
  overflow-wrap: anywhere;
}

.prose :deep(pre) {
  margin-block: 0 var(--gr-space-4);
  padding: var(--gr-space-3) var(--gr-space-4);
  border-radius: var(--gr-radius-md);
  background: var(--gr-muted);
  overflow-x: auto;
}

.prose :deep(pre code) {
  padding: 0;
  background: none;
}

.prose :deep(table) {
  width: 100%;
  max-width: none;
  border-collapse: collapse;
  font-size: var(--gr-text-xs);
  line-height: var(--gr-leading-xs);
}

.prose :deep(th),
.prose :deep(td) {
  padding: var(--gr-space-2) var(--gr-space-3);
  border-block-end: 1px solid var(--gr-brd);
  text-align: start;
  vertical-align: top;
}

.prose :deep(th) {
  color: var(--gr-muted-fg);
  font-weight: var(--gr-font-semibold);
}
</style>
