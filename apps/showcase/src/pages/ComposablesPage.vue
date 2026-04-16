<script setup lang="ts">
import { computed } from 'vue'

import PackageEntitiesCatalogPage from '../components/package/PackageEntitiesCatalogPage.vue'
import { showcaseComposableEntities } from '../app/showcase'
import { useShowcasePageI18n } from '../app/useShowcasePageI18n'

const { localizePageByName } = useShowcasePageI18n()

const page = computed(() => localizePageByName('composables'))
</script>

<template>
  <PackageEntitiesCatalogPage
    kind="composable"
    :page="page"
    :entities="showcaseComposableEntities"
  />
</template>