<script setup lang="ts">
import type { ShowcaseApiItemMeta } from '../../content/model'

import ApiTable from './ApiTable.vue'

defineProps<{
  items: ShowcaseApiItemMeta[]
}>()
</script>

<template>
  <ApiTable title="Props" :items="items" empty-label="Prop metadata будет добавлена генератором или fallback-слоем." />
</template>