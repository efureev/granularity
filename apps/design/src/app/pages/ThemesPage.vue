<script setup lang="ts">
import { RouterLink } from 'vue-router'

import IconArrowRight from '~icons/lucide/arrow-right'
import themeManifest from 'virtual:granum/themes'

import PageHeader from '../parts/PageHeader.vue'
import { plural } from '../plural'
import { designThemes, THEME_BUILD_LABEL } from '../themes'

const themes = designThemes(themeManifest)
</script>

<template>
  <div class="mx-auto flex max-w-[1360px] flex-col gap-10 px-4 py-10 lg:px-10">
    <PageHeader
      eyebrow="Темы"
      title="Каталог тем"
      lead="Тема — полный набор значений дизайн-языка: примитивы, роли каждого режима, пропсы компонентов по умолчанию. Приложение собирает одну или несколько: основная — в общем листе, остальные — своими листами, и переключается между ними без перезагрузки; здесь каждая показана на настоящих компонентах."
    />

    <ul class="grid gap-4 md:grid-cols-2">
      <li v-for="theme in themes" :key="theme.entry.id">
        <RouterLink :to="{ name: 'theme', params: { slug: theme.entry.id } }" class="theme-card">
          <span class="flex items-center justify-between gap-3">
            <span class="text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">{{ theme.entry.title }}</span>
            <GrIcon class="text-[var(--gr-muted-fg)]"><IconArrowRight /></GrIcon>
          </span>
          <span v-if="theme.entry.description" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
            {{ theme.entry.description }}
          </span>
          <span class="flex flex-wrap gap-1.5">
            <GrBadge :tone="theme.build === 'absent' ? 'warning' : 'success'" size="sm">
              {{ THEME_BUILD_LABEL[theme.build] }}
            </GrBadge>
            <GrBadge tone="neutral" size="sm">
              {{ plural(theme.entry.modes.length, ['режим', 'режима', 'режимов']) }}
            </GrBadge>
            <GrBadge tone="neutral" size="sm">
              <code class="font-[var(--gr-font-mono)]">{{ theme.entry.id }}</code>
            </GrBadge>
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.theme-card {
  display: flex;
  flex-direction: column;
  gap: var(--gr-space-2);
  height: 100%;
  padding: var(--gr-space-5);
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-lg);
  background: var(--gr-card);
  color: var(--gr-fg);
  transition:
    border-color var(--gr-duration-fast) var(--gr-ease-out),
    box-shadow var(--gr-duration-fast) var(--gr-ease-out);
}

.theme-card:hover {
  border-color: var(--gr-control-brd);
  box-shadow: var(--gr-shadow-1);
}

.theme-card:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}
</style>
