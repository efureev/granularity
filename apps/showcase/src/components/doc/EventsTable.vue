<script setup lang="ts">
import type { ShowcaseApiItemMeta } from '../../content/model'

import ApiTable from './ApiTable.vue'

defineProps<{
  items: ShowcaseApiItemMeta[]
}>()
</script>

<template>
  <ApiTable title="Events" :items="items" empty-label="Для этой сущности events пока не обнаружены или ещё не описаны fallback-слоем." />
</template>