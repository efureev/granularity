<script setup lang="ts">
import { computed } from 'vue'
import {
  RouterLink,
  useRoute,
} from 'vue-router'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import { DsButton, DsSegmented, type DsSegmentedOption } from '@feugene/granularity'

import { showcaseNavigationItems } from '../../app/showcase'
import { useShowcasePageI18n } from '../../app/useShowcasePageI18n'
import type { ShowcaseNavigationItem } from '../../app/showcase'
import ThemeSwitcher from '../ThemeSwitcher.vue'
import ShowcaseQuickSearch from './ShowcaseQuickSearch.vue'
import IconLayers from '~icons/lucide/layers'
import IconMenu from '~icons/lucide/menu'

const emit = defineEmits<{
  (event: 'open-mobile-navigation'): void
}>()

const route = useRoute()
const i18n = useFintI18n()
const { localizePageByName } = useShowcasePageI18n()

const localeOptions = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
] satisfies DsSegmentedOption[]

const selectedLocale = computed<'ru' | 'en'>({
  get() {
    return i18n.locale.value === 'ru' ? 'ru' : 'en'
  },
  set(value) {
    if (value !== i18n.locale.value) {
      void i18n.setLocale(value)
    }
  },
})

const topNavigationItems = computed(() => showcaseNavigationItems
  .filter(item => item.name !== 'overview')
  .map(item => {
    const localizedPage = localizePageByName(item.name)

    return {
      ...item,
      title: localizedPage.title,
      shortTitle: localizedPage.shortTitle,
      description: localizedPage.description,
    }
  }))

function isActiveNavigationItem(item: ShowcaseNavigationItem) {
  if (item.path === '/')
    return route.path === item.path

  return route.path === item.path || route.path.startsWith(`${item.path}/`)
}

function getTopNavigationItemClass(item: ShowcaseNavigationItem) {
  if (isActiveNavigationItem(item)) {
    return 'showcase-nav-item-active'
  }

  return 'showcase-nav-item-inactive'
}
</script>

<template>
  <header class="showcase-header sticky top-0 z-40 border-b backdrop-blur-sm">
    <div class="mx-auto max-w-7xl px-4 py-4 lg:px-8">
      <div class="flex items-center gap-3">
        <DsButton
          class="lg:hidden"
          variant="ghost"
          size="sm"
          square
          :aria-label="$t('showcase.header.openNavigation')"
          @click="emit('open-mobile-navigation')"
        >
          <IconMenu class="h-4 w-4" aria-hidden="true" />
        </DsButton>

        <RouterLink
          to="/"
          class="flex min-w-0 items-center gap-3"
        >
          <div
              class="h-9 w-9 rounded-[12px] border border-[var(--brd)] bg-[var(--card)] flex items-center justify-center shadow-[var(--ds-shadow-1)]"
              aria-hidden="true"
          >
            <IconLayers class="h-4 w-4 text-[var(--muted-fg)]" />
          </div>
          <div class="min-w-0">
            <p class="truncate text-base font-semibold">
              Granularity
            </p>
            <p class="showcase-text-subtle truncate text-xs">
              {{ $t('showcase.header.subtitle') }}
            </p>
          </div>
        </RouterLink>

        <nav class="ml-6 hidden min-w-0 flex-1 items-center gap-2 lg:flex">
          <RouterLink
            v-for="item in topNavigationItems"
            :key="item.name"
            :to="item.path"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
            :class="getTopNavigationItemClass(item)"
          >
            {{ item.shortTitle }}
          </RouterLink>
        </nav>

        <div class="ml-auto flex items-center gap-1 sm:gap-2">
          <DsSegmented
            v-model="selectedLocale"
            class="hidden sm:inline-grid font-semibold showcase-pill"
            size="sm"
            :options="localeOptions"
            :aria-label="$t('showcase.header.languageLabel')"
          />
          <ShowcaseQuickSearch />
          <ThemeSwitcher />
        </div>
      </div>

      <nav class="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        <RouterLink
          v-for="item in topNavigationItems"
          :key="item.name"
          :to="item.path"
          class="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
          :class="getTopNavigationItemClass(item)"
        >
          {{ item.shortTitle }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>