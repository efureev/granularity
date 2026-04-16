<script setup lang="ts">
import type { ShowcaseApiItemMeta } from '../../content/model'

import ApiTable from './ApiTable.vue'

defineProps<{
  items: ShowcaseApiItemMeta[]
}>()
</script>

<template>
  <ApiTable title="Slots" :items="items" empty-label="Slot metadata будет добавлена генератором или fallback-слоем." />
</template>