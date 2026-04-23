<script setup lang="ts">
import { useFintI18n } from '@feugene/fint-i18n/vue'

import type { ShowcaseApiItemMeta } from '../../content/model'

import ApiTable from './ApiTable.vue'

const { t } = useFintI18n()

defineProps<{
  items: ShowcaseApiItemMeta[]
}>()
</script>

<template>
  <ApiTable
    :title="t('showcase.docComponents.table.propsTitle')"
    :items="items"
    :empty-label="t('showcase.docComponents.emptyLabel.props')"
  />
</template>
