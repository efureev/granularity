<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import themeManifest from 'virtual:granum/themes'

import DocSection from '../parts/DocSection.vue'
import { builtThemes } from '../themes'
import { previewOf, useCatalogComponent } from './views'

const route = useRoute()
const component = useCatalogComponent()
const preview = computed(() => previewOf(component.value))
const current = computed(() => String(route.params.theme))
const themes = builtThemes(themeManifest)
</script>

<template>
  <DocSection title="Один образец — каждая тема" lead="Тот же образец в каждой теме сборки, в её режиме по умолчанию. Компоненты настоящие: наведите и нажмите. Название темы ведёт на эту страницу под ней.">
    <ul class="grid gap-4 lg:grid-cols-2" aria-label="Компонент в темах сборки">
      <li v-for="theme in themes" :key="theme.entry.id" class="themes-card" :data-current="theme.entry.id === current ? '' : undefined">
        <div class="flex items-center justify-between gap-3 px-4 py-3">
          <RouterLink class="themes-link" :to="{ params: { theme: theme.entry.id }, query: route.query }">
            {{ theme.entry.title }}
          </RouterLink>
          <GrBadge v-if="theme.entry.id === current" tone="primary" size="xs">
            выбрана
          </GrBadge>
        </div>
        <GrConfigProvider :theme="theme.entry.id">
          <div class="isolate flex min-h-[120px] flex-col justify-center gap-3 bg-[var(--gr-bg)] p-5 text-[var(--gr-fg)]">
            <component :is="preview" v-if="preview" />
          </div>
        </GrConfigProvider>
      </li>
    </ul>
  </DocSection>
</template>

<style scoped>
.themes-card {
  overflow: hidden;
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-lg);
  background: var(--gr-card);
}

.themes-card[data-current] {
  border-color: var(--gr-fg);
}

.themes-link {
  color: var(--gr-fg);
  font-size: var(--gr-text-sm);
  font-weight: var(--gr-font-semibold);
  line-height: var(--gr-leading-sm);
  text-decoration: none;
  border-radius: var(--gr-radius-xs);
}

.themes-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.themes-link:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}
</style>
