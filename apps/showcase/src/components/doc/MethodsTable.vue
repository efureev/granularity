<script setup lang="ts">
import type { ShowcaseApiItemMeta } from '../../content/model'

import ApiTable from './ApiTable.vue'

defineProps<{
  items: ShowcaseApiItemMeta[]
}>()
</script>

<template>
  <ApiTable title="Methods / Expose" :items="items" empty-label="Imperative API пока не обнаружен или будет добавлен вручную через fallback-слой." />
</template>