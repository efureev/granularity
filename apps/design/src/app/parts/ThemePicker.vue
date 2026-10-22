<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import themeManifest from 'virtual:granum/themes'

import { builtThemes } from '../themes'

/**
 * Выбор темы карточками: в каждой — тот же образец в своей теме, островом
 * `GrConfigProvider`. Карточка — ссылка на ту же страницу под другой темой
 * (вкладка сохраняется): тема адреса — тема всего приложения.
 */
defineProps<{
  /** Характер темы по её названию — строка «Характер» таблицы сравнения. */
  traits?: ReadonlyMap<string, string>
}>()

defineSlots<{ preview: (props: { theme: string }) => unknown }>()

const route = useRoute()
const themes = builtThemes(themeManifest)
const current = computed(() => String(route.params.theme))
</script>

<template>
  <ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Темы каталога">
    <li v-for="theme in themes" :key="theme.entry.id">
      <div class="theme-card" :data-current="theme.entry.id === current ? '' : undefined">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-0.5">
            <RouterLink class="theme-card-link" :to="{ params: { theme: theme.entry.id }, query: route.query }">
              {{ theme.entry.title }}
            </RouterLink>
            <span v-if="traits?.get(theme.entry.title)" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              {{ traits.get(theme.entry.title) }}
            </span>
          </div>
          <GrBadge v-if="theme.entry.id === current" tone="primary" size="xs">
            выбрана
          </GrBadge>
          <GrBadge v-else-if="theme.build === 'default'" tone="primary" dark size="xs">
            основная
          </GrBadge>
        </div>
        <!-- Образец не интерактивен: карточка целиком — ссылка, кнопки внутри ссылки недопустимы. -->
        <div class="theme-card-stage" inert>
          <GrConfigProvider :theme="theme.entry.id">
            <div class="flex min-h-[72px] flex-wrap items-center gap-2 bg-[var(--gr-bg)] px-4 py-3 text-[var(--gr-fg)]">
              <slot name="preview" :theme="theme.entry.id" />
            </div>
          </GrConfigProvider>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--gr-space-3);
  height: 100%;
  padding: var(--gr-space-3);
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-lg);
  background: var(--gr-card);
  transition:
    border-color var(--gr-duration-fast) var(--gr-ease-out),
    box-shadow var(--gr-duration-fast) var(--gr-ease-out);
}

.theme-card:hover {
  border-color: var(--gr-control-brd);
  box-shadow: var(--gr-shadow-1);
}

.theme-card[data-current] {
  border-color: var(--gr-primary);
  box-shadow: inset 0 0 0 1px var(--gr-primary);
}

/* Фокус ссылки рисуется контуром карточки: ссылка растянута на неё целиком. */
.theme-card:has(.theme-card-link:focus-visible) {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}

.theme-card-link {
  color: var(--gr-fg);
  font-size: var(--gr-text-sm);
  font-weight: 600;
  line-height: var(--gr-leading-sm);
  text-decoration: none;
  outline: none;
}

.theme-card-link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.theme-card-stage {
  overflow: hidden;
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-md);
}
</style>
