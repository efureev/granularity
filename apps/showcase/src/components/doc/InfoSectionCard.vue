<script setup lang="ts">
import { computed } from 'vue'

import InlineRichText from '../content/InlineRichText.vue'
import type { ShowcaseRelatedLink } from './entityPageHelpers'

const props = defineProps<{
  title: string
  items?: string[]
  links?: ShowcaseRelatedLink[]
  variant?: 'list' | 'chips' | 'links'
}>()

const resolvedVariant = computed(() => {
  if (props.variant)
    return props.variant

  if (props.links?.length)
    return 'links'

  return 'list'
})
</script>

<template>
  <article class="showcase-panel-soft rounded-3xl border p-5">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold uppercase tracking-[0.16em] showcase-text-subtle">
        {{ title }}
      </h3>
      <span
        v-if="items?.length || links?.length"
        class="showcase-text-subtle text-xs font-medium"
      >
        {{ links?.length ?? items?.length }}
      </span>
    </div>

    <ul
      v-if="resolvedVariant === 'list' && items?.length"
      class="mt-4 grid gap-3"
    >
      <li
        v-for="item in items"
        :key="item"
        class="showcase-inline-surface px-3 py-1.5 showcase-text-muted text-sm leading-6"
      >
        <InlineRichText :text="item" />
      </li>
    </ul>

    <ul
      v-else-if="resolvedVariant === 'chips' && items?.length"
      class="mt-4 flex flex-wrap gap-2"
    >
      <li v-for="item in items" :key="item">
        <span class="showcase-pill inline-flex items-center px-3 py-1.5 text-sm font-medium">
          <InlineRichText :text="item" />
        </span>
      </li>
    </ul>

    <ul
      v-else-if="links?.length"
      class="mt-4 grid gap-2"
    >
      <li v-for="link in links" :key="`${link.label}-${link.href}`">
        <a
          :href="link.href"
          class="showcase-inline-surface showcase-interactive-accent flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium transition-colors"
          target="_blank"
          rel="noreferrer"
        >
          <span>{{ link.label }}</span>
          <span class="showcase-text-subtle text-xs uppercase tracking-[0.16em]">
            {{ $t('showcase.detailPage.relatedLinks.openLabel') }}
          </span>
        </a>
      </li>
    </ul>
  </article>
</template>