<script setup lang="ts">
import { computed } from 'vue'

import PackageEntitiesCatalogPage from '../components/package/PackageEntitiesCatalogPage.vue'
import { showcaseDirectiveEntities } from '../app/showcase'
import { useShowcasePageI18n } from '../app/useShowcasePageI18n'

const { localizePageByName } = useShowcasePageI18n()

const page = computed(() => localizePageByName('directives'))
</script>

<template>
  <PackageEntitiesCatalogPage
    kind="directive"
    :page="page"
    :entities="showcaseDirectiveEntities"
  />
</template>