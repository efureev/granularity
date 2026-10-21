<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useTheme } from '@feugene/granularity'

import IconLayoutGrid from '~icons/lucide/layout-grid'
import IconLibrary from '~icons/lucide/library'
import IconMousePointerClick from '~icons/lucide/mouse-pointer-click'
import IconSwatchBook from '~icons/lucide/swatch-book'
import themeManifest from 'virtual:granum/themes'

import { catalog } from '../catalog'
import { foundations } from '../foundations'
import { plural } from '../plural'
import { THEME_STORAGE_KEY } from '../theme'
import { designThemes, THEME_BUILD_LABEL } from '../themes'

defineProps<{ overlay: boolean }>()

const open = defineModel<boolean>('open', { default: false })

const route = useRoute()

// Тему ссылкам задаём явно: панель видна и на «не найдено», где темы в адресе нет.
const { theme: documentTheme } = useTheme({ storageKey: THEME_STORAGE_KEY })
const theme = computed(() => (typeof route.params.theme === 'string' ? route.params.theme : documentTheme.value))

const themes = designThemes(themeManifest)

const componentIcons: Record<string, typeof IconLayoutGrid> = {
  button: IconMousePointerClick,
}
</script>

<template>
  <GrSidebar
    v-model:open="open"
    class="lg:sticky lg:top-0 lg:h-screen"
    landmark="navigation"
    aria-label="Разделы дизайн-системы"
    width="264px"
    :overlay="overlay"
    :show-toggle-button="overlay"
  >
    <template #title>
      granularity
    </template>
    <template #subtitle>
      Дизайн-система
    </template>

    <div class="flex flex-col gap-1 p-2">
      <GrSidebarItem
        label="Обзор"
        :icon="IconLayoutGrid"
        :as="RouterLink"
        :to="{ name: 'overview', params: { theme } }"
        :active="route.name === 'overview'"
      />

      <GrSidebarGroup label="Основы">
        <GrSidebarItem
          v-for="foundation in foundations"
          :key="foundation.id"
          :label="foundation.title"
          :icon="foundation.icon"
          :as="RouterLink"
          :to="{ name: 'foundation', params: { theme, foundation: foundation.id } }"
          :active="route.name === 'foundation' && route.params.foundation === foundation.id"
        />
      </GrSidebarGroup>

      <GrSidebarGroup label="Темы">
        <GrSidebarItem
          label="Каталог тем"
          :icon="IconLibrary"
          :as="RouterLink"
          :to="{ name: 'themes', params: { theme } }"
          :active="route.name === 'themes'"
        />
        <GrSidebarItem
          v-for="entry in themes"
          :key="entry.entry.id"
          :label="entry.entry.title"
          :icon="IconSwatchBook"
          :badge="THEME_BUILD_LABEL[entry.build]"
          :as="RouterLink"
          :to="{ name: 'theme', params: { theme, slug: entry.entry.id } }"
          :active="route.name === 'theme' && route.params.slug === entry.entry.id"
        />
      </GrSidebarGroup>

      <GrSidebarGroup label="Компоненты">
        <GrSidebarItem
          v-for="component in catalog"
          :key="component.id"
          :label="component.name"
          :icon="componentIcons[component.id]"
          :badge="plural(component.versions.length, ['версия', 'версии', 'версий'])"
          :as="RouterLink"
          :to="{ name: 'component', params: { theme, component: component.id } }"
          :active="route.name === 'component' && route.params.component === component.id"
        />
      </GrSidebarGroup>
    </div>
  </GrSidebar>
</template>
