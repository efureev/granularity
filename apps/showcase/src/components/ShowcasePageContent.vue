<script setup lang="ts">
import { computed } from 'vue'

import { showcaseEntityRegistry } from '../app/showcase'
import type { ShowcasePage } from '../app/showcase'
import {
  createAccessibilityItems,
  createDependencyItems,
  createRelatedLinks,
  createUsageSnippet,
  resolveFeaturedEntity,
} from './doc/entityPageHelpers'
import DocPage from './doc/DocPage.vue'

const props = defineProps<{
  page: ShowcasePage
}>()

const featuredEntity = computed(() => resolveFeaturedEntity(props.page.name, showcaseEntityRegistry))
const usageCode = computed(() => createUsageSnippet(featuredEntity.value))
const accessibilityItems = computed(() => createAccessibilityItems(featuredEntity.value))
const dependencyItems = computed(() => createDependencyItems(featuredEntity.value))
const relatedLinks = computed(() => createRelatedLinks(featuredEntity.value))
</script>

<template>
  <DocPage
    :eyebrow="page.eyebrow"
    :title="page.title"
    :description="page.description"
    :status="page.status"
    :sections="page.sections"
    :examples="featuredEntity?.examples"
    :api-sections="featuredEntity?.apiSections"
    :usage-code="usageCode"
    :accessibility-items="accessibilityItems"
    :dependency-items="dependencyItems"
    :related-links="relatedLinks"
  />
</template>