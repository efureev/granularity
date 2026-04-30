<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  RouterLink,
  RouterView,
  useRoute,
} from 'vue-router'

import { GrButton } from '@feugene/granularity'

import {
  getShowcaseEntityByPath,
  getShowcasePageByName,
  getShowcasePageByPath,
  getShowcaseSectionsForPath,
  showcaseComposableEntities,
  showcaseComponentEntities,
  showcaseDirectiveEntities,
  showcaseNavigationItems,
  showcasePageRecord,
  showcaseUtilityEntities,
} from '../app/showcase'
import { useShowcasePageI18n } from '../app/useShowcasePageI18n'
import type { ShowcaseNavigationItem, ShowcasePageName } from '../app/showcase'
import type { ShowcaseEntityRegistryItem } from '../content/model'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import ShowcaseHeader from '../components/layout/ShowcaseHeader.vue'
import ShowcaseQuickSearch from '../components/layout/ShowcaseQuickSearch.vue'
import ShowcaseSidebarNavigation from '../components/layout/ShowcaseSidebarNavigation.vue'
import IconX from '~icons/lucide/x'

const route = useRoute()
const isMobileNavigationOpen = ref(false)

const {
  getEntityGroupLabel,
  localizePage,
  localizePageByName,
  localizeSections,
} = useShowcasePageI18n()

watch(() => route.fullPath, () => {
  isMobileNavigationOpen.value = false
})

const currentPage = computed(() => {
  return getShowcasePageByName(route.name)
    ?? getShowcasePageByPath(route.path)
    ?? showcasePageRecord.overview
})
const currentEntity = computed(() => getShowcaseEntityByPath(route.path))
const localizedCurrentPage = computed(() => localizePage(currentPage.value))

const breadcrumbs = computed(() => {
  const currentEntityValue = currentEntity.value
  const currentPageValue = localizePage(currentPage.value)
  const overviewPage = localizePageByName('overview')

  if (currentEntityValue && currentPageValue.path !== '/') {
    return [
      {
        label: overviewPage.shortTitle,
        to: overviewPage.path,
      },
      {
        label: currentPageValue.shortTitle,
        to: currentPageValue.path,
      },
      {
        label: currentEntityValue.title,
        to: currentEntityValue.path,
      },
    ]
  }

  if (currentPageValue.path === '/') {
    return [
      {
        label: overviewPage.shortTitle,
        to: overviewPage.path,
      },
    ]
  }

  return [
    {
      label: overviewPage.shortTitle,
      to: overviewPage.path,
    },
    {
      label: currentPageValue.shortTitle,
      to: currentPageValue.path,
    },
  ]
})
const currentSections = computed(() => {
  const sections = getShowcaseSectionsForPath(route.path)

  if (currentEntity.value) {
    return sections
  }

  return localizeSections(currentPage.value.name, sections)
})
const currentTitle = computed(() => currentEntity.value?.title ?? localizedCurrentPage.value.title)
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

type SidebarNavigationItem = {
  id: string
  label: string
  to?: string
  href?: string
}

type SidebarNavigationGroup = {
  id: string
  title: string
  items: SidebarNavigationItem[]
}

function getEntityCollection(pageName: ShowcasePageName): ShowcaseEntityRegistryItem[] {
  switch (pageName) {
    case 'components':
      return showcaseComponentEntities
    case 'directives':
      return showcaseDirectiveEntities
    case 'composables':
      return showcaseComposableEntities
    case 'utilities':
      return showcaseUtilityEntities
    default:
      return []
  }
}

const contextNavigationGroups = computed<SidebarNavigationGroup[]>(() => {
  const pageName = currentPage.value.name

  if (pageName === 'overview' || pageName === 'foundations') {
    return [
      {
        id: `${pageName}-sections`,
        title: localizePageByName(pageName).shortTitle,
        items: currentSections.value.map(section => ({
          id: section.id,
          label: section.title,
          href: `#${section.id}`,
        })),
      },
    ]
  }

  const entities = getEntityCollection(pageName)
  const groups = new Map<string, ShowcaseEntityRegistryItem[]>()

  for (const entity of entities) {
    const groupKey = entity.group || 'misc'
    const currentGroup = groups.get(groupKey) ?? []

    currentGroup.push(entity)
    groups.set(groupKey, currentGroup)
  }

  return [...groups.entries()]
    .sort(([left], [right]) => {
      return getEntityGroupLabel(pageName, left).localeCompare(getEntityGroupLabel(pageName, right))
    })
    .map(([group, entities]) => ({
      id: `${pageName}-${group}`,
      title: getEntityGroupLabel(pageName, group),
      items: [...entities]
        .sort((left, right) => left.title.localeCompare(right.title))
        .map(entity => ({
          id: entity.id,
          label: entity.title,
          to: entity.path,
        })),
    }))
})

function isActiveNavigationItem(item: ShowcaseNavigationItem) {
  if (item.path === '/')
    return currentPage.value.path === item.path

  return currentPage.value.path === item.path || route.path.startsWith(`${item.path}/`)
}

function isActiveSidebarItem(item: SidebarNavigationItem) {
  if (!item.to)
    return false

  if (item.to === '/')
    return route.path === item.to

  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

function getTopNavigationItemClass(item: ShowcaseNavigationItem) {
  if (isActiveNavigationItem(item)) {
    return 'showcase-nav-item-active'
  }

  return 'showcase-nav-item-inactive'
}

function getSidebarItemClass(item: SidebarNavigationItem) {
  if (isActiveSidebarItem(item)) {
    return 'showcase-sidebar-item-active'
  }

  return 'showcase-sidebar-item-inactive'
}
</script>

<template>
  <div class="showcase-shell transition-colors">
    <ShowcaseHeader @open-mobile-navigation="isMobileNavigationOpen = true" />

    <div class="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-8">
      <ShowcaseSidebarNavigation
        :eyebrow="localizedCurrentPage.shortTitle"
        :title="currentTitle"
        :groups="contextNavigationGroups"
      />

      <main class="min-w-0 space-y-6">
        <div class="showcase-panel flex flex-wrap items-center gap-2 rounded-[24px] border px-4 py-3 text-sm">
          <template
            v-for="(crumb, index) in breadcrumbs"
            :key="`${crumb.to}-${index}`"
          >
            <RouterLink
              :to="crumb.to"
              class="showcase-text-subtle font-medium transition-colors hover:text-[var(--fg)]"
            >
              {{ crumb.label }}
            </RouterLink>
            <span
              v-if="index < breadcrumbs.length - 1"
              class="showcase-text-subtle"
            >/</span>
          </template>
        </div>

        <RouterView />
      </main>
    </div>

    <div
      v-if="isMobileNavigationOpen"
      class="fixed inset-0 z-50 flex lg:hidden"
    >
      <button
        class="showcase-backdrop flex-1 backdrop-blur-sm"
        :aria-label="$t('showcase.navigation.close')"
        @click="isMobileNavigationOpen = false"
      />

      <aside class="showcase-overlay flex h-full w-[min(88vw,380px)] flex-col gap-5 border-r p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
              {{ $t('showcase.header.navigationLabel') }}
            </p>
            <h2 class="text-lg font-semibold">
              {{ currentTitle }}
            </h2>
          </div>

          <GrButton
            variant="ghost"
            size="sm"
            square
            :aria-label="$t('showcase.navigation.close')"
            @click="isMobileNavigationOpen = false"
          >
            <IconX class="h-4 w-4" aria-hidden="true" />
          </GrButton>
        </div>

        <nav class="grid gap-2">
          <RouterLink
            v-for="item in topNavigationItems"
            :key="item.name"
            :to="item.path"
            class="rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors"
            :class="getTopNavigationItemClass(item)"
            @click="isMobileNavigationOpen = false"
          >
            {{ item.shortTitle }}
          </RouterLink>
        </nav>

        <div class="showcase-inline-surface flex items-center gap-2 rounded-2xl border p-2">
          <div class="showcase-pill flex items-center rounded-full border p-1 text-xs font-semibold">
            <span class="showcase-nav-item-active rounded-full px-3 py-1.5">RU</span>
            <span class="px-3 py-1.5 opacity-60">EN</span>
          </div>
          <div class="ml-auto flex items-center gap-1">
            <ShowcaseQuickSearch />
            <ThemeSwitcher />
          </div>
        </div>

        <div class="showcase-inline-surface space-y-4 overflow-y-auto rounded-3xl border p-4">
          <p class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
            {{ $t('showcase.header.contextNavigationLabel') }}
          </p>
          <section
            v-for="group in contextNavigationGroups"
            :key="group.id"
            class="space-y-2"
          >
            <p class="showcase-kicker text-xs font-semibold">
              {{ group.title }}
            </p>
            <div class="grid gap-2">
              <template v-for="item in group.items" :key="item.id">
                <RouterLink
                  v-if="item.to"
                  :to="item.to"
                  class="rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors"
                  :class="getSidebarItemClass(item)"
                  @click="isMobileNavigationOpen = false"
                >
                  {{ item.label }}
                </RouterLink>
                <a
                  v-else-if="item.href"
                  :href="item.href"
                  class="showcase-sidebar-item-inactive rounded-2xl border border-transparent px-3 py-3 text-sm font-semibold transition-colors"
                  @click="isMobileNavigationOpen = false"
                >
                  {{ item.label }}
                </a>
              </template>
            </div>
          </section>
        </div>
      </aside>
    </div>
  </div>
</template>