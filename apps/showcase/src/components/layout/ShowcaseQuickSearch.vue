<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {RouterLink, useRoute} from 'vue-router'

import {GrBadge, GrButton} from '@feugene/granularity'
import {vClickOutside} from '@feugene/granularity/directives'

import {
  searchShowcaseEntries,
  showcaseSuggestedSearchEntries,
} from '../../app/showcaseDiscoverability'
import SearchIcon from '~icons/lucide/search'

const route = useRoute()

const isOpen = ref(false)
const query = ref('')

const results = computed(() => {
  const normalizedQuery = query.value.trim()

  if (!normalizedQuery)
    return showcaseSuggestedSearchEntries

  return searchShowcaseEntries(normalizedQuery, 8)
})

const hasNoResults = computed(() => query.value.trim().length > 0 && results.value.length === 0)

watch(() => route.fullPath, () => {
  isOpen.value = false
  query.value = ''
})

function toggleSearch() {
  isOpen.value = !isOpen.value

  if (!isOpen.value)
    query.value = ''
}

function closeSearch() {
  isOpen.value = false
  query.value = ''
}
</script>

<template>
  <div
      v-click-outside="{ handler: closeSearch, enabled: isOpen }"
      class="relative"
  >
    <div class="inline-flex">
      <GrButton
          variant="ghost"
          size="sm"
          square
          :aria-label="$t('showcase.search.open')"
          @click="toggleSearch()"
      >
        <SearchIcon/>
      </GrButton>
    </div>

    <div
        v-if="isOpen"
        class="showcase-overlay absolute right-0 top-[calc(100%+0.75rem)] z-50 flex w-[min(92vw,30rem)] max-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-[28px] border p-4 sm:max-h-[calc(100dvh-6rem)]"
    >
      <div class="flex min-h-0 flex-1 flex-col space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
              {{ $t('showcase.header.searchLabel') }}
            </p>
            <p class="showcase-text-muted text-sm leading-6">
              {{ $t('showcase.search.summary') }}
            </p>
          </div>

          <GrBadge>
            {{ results.length }}
          </GrBadge>
        </div>

        <input
            v-model="query"
            type="search"
            :placeholder="$t('showcase.search.placeholder')"
            class="showcase-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors"
        >

        <div v-if="hasNoResults"
             class="showcase-empty-state min-h-0 overflow-y-auto overscroll-contain space-y-3 rounded-2xl border border-dashed px-4 py-4">
          <p class="text-sm leading-6">
            {{ $t('showcase.search.noResults') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <RouterLink
                to="/components"
                class="showcase-link-chip inline-flex rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors"
                @click="closeSearch()"
            >
              {{ $t('showcase.search.openComponents') }}
            </RouterLink>
            <RouterLink
                to="/utilities"
                class="showcase-link-chip inline-flex rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors"
                @click="closeSearch()"
            >
              {{ $t('showcase.search.openUtilities') }}
            </RouterLink>
          </div>
        </div>

        <div v-else class="min-h-0 overflow-y-auto overscroll-contain pr-1">
          <div class="grid gap-2">
            <RouterLink
                v-for="result in results"
                :key="result.id"
                :to="result.href"
                class="showcase-sidebar-item-inactive rounded-2xl border border-transparent px-4 py-3 transition-colors"
                @click="closeSearch()"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">
                    {{ result.title }}
                  </p>
                  <p class="showcase-text-muted mt-1 text-xs leading-5">
                    {{ result.description }}
                  </p>
                  <p class="showcase-kicker mt-2 text-[11px]">
                    {{ result.context }}
                  </p>
                </div>

                <GrBadge>
                  {{ result.kindLabel }}
                </GrBadge>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>