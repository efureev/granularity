<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useTheme } from '@feugene/granularity'

import IconAppWindow from '~icons/lucide/app-window'
import IconBell from '~icons/lucide/bell'
import IconBlocks from '~icons/lucide/blocks'
import IconCompass from '~icons/lucide/compass'
import IconLayoutGrid from '~icons/lucide/layout-grid'
import IconLibrary from '~icons/lucide/library'
import IconListCollapse from '~icons/lucide/list-collapse'
import IconLoader from '~icons/lucide/loader'
import IconMousePointerClick from '~icons/lucide/mouse-pointer-click'
import IconPanelTop from '~icons/lucide/panel-top'
import IconShapes from '~icons/lucide/shapes'
import IconSquare from '~icons/lucide/square'
import IconSquareCheck from '~icons/lucide/square-check'
import IconSwatchBook from '~icons/lucide/swatch-book'
import IconTable from '~icons/lucide/table'
import IconTextCursorInput from '~icons/lucide/text-cursor-input'
import themeManifest from 'virtual:granum/themes'

import { catalog, catalogGroups, findComponent } from '../catalog'
import { foundations } from '../foundations'
import { THEME_STORAGE_KEY } from '../theme'
import { orderedThemes, THEME_BUILD_LABEL } from '../themes'

defineProps<{ overlay: boolean }>()

const open = defineModel<boolean>('open', { default: false })

const route = useRoute()

// Тему ссылкам задаём явно: панель видна и на «не найдено», где темы в адресе нет.
const { theme: documentTheme } = useTheme({ storageKey: THEME_STORAGE_KEY })
const theme = computed(() => (typeof route.params.theme === 'string' ? route.params.theme : documentTheme.value))

const themes = orderedThemes(themeManifest)

const groupIcons: Record<string, typeof IconLayoutGrid> = {
  buttons: IconMousePointerClick,
  fields: IconTextCursorInput,
  choice: IconSquareCheck,
  overlays: IconPanelTop,
  tabs: IconListCollapse,
  status: IconBell,
  surfaces: IconSquare,
  modals: IconAppWindow,
  data: IconTable,
  navigation: IconCompass,
  waiting: IconLoader,
  misc: IconShapes,
}

const navGroups = catalogGroups.map(group => ({ ...group, items: catalog.filter(component => component.group === group.id) }))

// Группа текущего компонента раскрыта: путь к странице виден в меню, а не только в шапке.
const expanded = reactive(new Set<string>())
watch(() => (route.name === 'component' ? findComponent(String(route.params.component))?.group : undefined), (group) => {
  if (group)
    expanded.add(group)
}, { immediate: true })

function toggle(group: string, open: boolean): void {
  if (open)
    expanded.add(group)
  else
    expanded.delete(group)
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
          :data-theme-build="entry.build"
          :as="RouterLink"
          :to="{ name: 'theme', params: { theme, slug: entry.entry.id } }"
          :active="route.name === 'theme' && route.params.slug === entry.entry.id"
        />
      </GrSidebarGroup>

      <GrSidebarGroup label="Компоненты">
        <GrSidebarItem
          label="Все компоненты"
          :icon="IconBlocks"
          :badge="catalog.length"
          :as="RouterLink"
          :to="{ name: 'components', params: { theme } }"
          :active="route.name === 'components'"
        />
        <GrSidebarItem
          v-for="group in navGroups"
          :key="group.id"
          :label="group.title"
          :icon="groupIcons[group.id]"
          :expanded="expanded.has(group.id)"
          @update:expanded="toggle(group.id, $event)"
        >
          <GrSidebarItem
            v-for="component in group.items"
            :key="component.id"
            :label="component.name"
            :as="RouterLink"
            :to="{ name: 'component', params: { theme, component: component.id } }"
            :active="route.name === 'component' && route.params.component === component.id"
          />
        </GrSidebarItem>
      </GrSidebarGroup>
    </div>
  </GrSidebar>
</template>

<style scoped>
/*
 * Метка основной темы — заливкой: от «дополнительных» она отличается с первого
 * взгляда, и на подложке активного пункта не теряется. У пункта нет своего тона
 * метки, поэтому — по атрибуту, который пункт получает от панели.
 */
:deep([data-gr-sidebar-item][data-theme-build='default'] > span:last-child) {
  background: var(--gr-primary-solid);
  color: var(--gr-primary-solid-fg);
}
</style>
