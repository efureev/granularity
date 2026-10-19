<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

import IconLayoutGrid from '~icons/lucide/layout-grid'
import IconMousePointerClick from '~icons/lucide/mouse-pointer-click'

import { catalog } from '../catalog'
import { foundations } from '../foundations'
import { plural } from '../plural'

defineProps<{ overlay: boolean }>()

const open = defineModel<boolean>('open', { default: false })

const route = useRoute()

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
        to="/"
        :active="route.name === 'overview'"
      />

      <GrSidebarGroup label="Основы">
        <GrSidebarItem
          v-for="foundation in foundations"
          :key="foundation.id"
          :label="foundation.title"
          :icon="foundation.icon"
          :as="RouterLink"
          :to="`/foundations/${foundation.id}`"
          :active="route.name === 'foundation' && route.params.foundation === foundation.id"
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
          :to="`/components/${component.id}`"
          :active="route.name === 'component' && route.params.component === component.id"
        />
      </GrSidebarGroup>
    </div>
  </GrSidebar>
</template>
