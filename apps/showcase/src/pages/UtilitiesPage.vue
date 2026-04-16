<script setup lang="ts">
import { computed } from 'vue'

import PackageEntitiesCatalogPage from '../components/package/PackageEntitiesCatalogPage.vue'
import { showcaseUtilityEntities } from '../app/showcase'
import { useShowcasePageI18n } from '../app/useShowcasePageI18n'

const { localizePageByName } = useShowcasePageI18n()

const page = computed(() => localizePageByName('utilities'))
</script>

<template>
  <PackageEntitiesCatalogPage
    kind="utility"
    :page="page"
    :entities="showcaseUtilityEntities"
  />
</template>