<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { THEME_BUILD_LABEL, type DesignTheme, themeLineage } from '../themes'
import ThemeSpecimen from './ThemeSpecimen.vue'

/**
 * Карточка каталога: образец интерфейса в теме — островом её пары — и паспорт
 * темы. Карточка целиком — ссылка на страницу темы; образец не интерактивен.
 */
const props = defineProps<{
  theme: DesignTheme
  /** Режим образца; у темы без такого режима — её режим по умолчанию. */
  mode: string
  /** Тема всего приложения сейчас. */
  current: boolean
}>()

const specimenMode = computed(() => (props.theme.modes.some(mode => mode.name === props.mode) ? props.mode : props.theme.entry.defaultMode))
const modeTitles = computed(() => props.theme.entry.modes.map(mode => mode.title ?? mode.name).join(', '))
</script>

<template>
  <article class="catalog-card" :data-current="current ? '' : undefined">
    <div class="catalog-card-stage" inert>
      <GrConfigProvider v-if="theme.build !== 'absent'" :theme="theme.entry.id" :mode="specimenMode">
        <ThemeSpecimen />
      </GrConfigProvider>
      <p v-else class="flex min-h-[200px] items-center justify-center p-5 text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]">
        Темы нет в сборке — образца нет
      </p>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">
          <RouterLink class="catalog-card-link" :to="{ name: 'theme', params: { slug: theme.entry.id } }">
            {{ theme.entry.title }}
          </RouterLink>
        </h2>
        <span class="flex flex-wrap gap-1.5">
          <GrBadge v-if="current" tone="primary" size="sm">
            тема приложения
          </GrBadge>
          <GrBadge :tone="theme.build === 'absent' ? 'warning' : theme.build === 'default' ? 'primary' : 'neutral'" :dark="theme.build === 'default'" size="sm">
            {{ THEME_BUILD_LABEL[theme.build] }}
          </GrBadge>
        </span>
      </div>
      <p v-if="theme.entry.description" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
        {{ theme.entry.description }}
      </p>
      <dl class="mt-auto grid grid-cols-3 gap-3 border-t border-[var(--gr-brd)] pt-3 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
        <div class="flex min-w-0 flex-col gap-0.5">
          <dt class="text-[var(--gr-muted-fg)]">
            происхождение
          </dt>
          <dd class="font-500">
            {{ themeLineage(theme.entry) }}
          </dd>
        </div>
        <div class="flex min-w-0 flex-col gap-0.5">
          <dt class="text-[var(--gr-muted-fg)]">
            режимы
          </dt>
          <dd class="font-500">
            {{ modeTitles }}
          </dd>
        </div>
        <div class="flex min-w-0 flex-col gap-0.5">
          <dt class="text-[var(--gr-muted-fg)]">
            id · версия
          </dt>
          <dd class="font-500">
            <code class="font-[var(--gr-font-mono)]">{{ theme.entry.id }}</code><template v-if="theme.entry.version">
              · {{ theme.entry.version }}
            </template>
          </dd>
        </div>
      </dl>
    </div>
  </article>
</template>

<style scoped>
.catalog-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-lg);
  background: var(--gr-card);
  color: var(--gr-fg);
  transition:
    border-color var(--gr-duration-fast) var(--gr-ease-out),
    box-shadow var(--gr-duration-fast) var(--gr-ease-out);
}

.catalog-card:hover {
  border-color: var(--gr-control-brd);
  box-shadow: var(--gr-shadow-2);
}

.catalog-card[data-current] {
  border-color: var(--gr-primary);
}

/*
 * Второй пиксель рамки выбранной карточки — слоем поверх содержимого: образец
 * стоит вплотную к краю, и внутренняя тень ушла бы под него — рамка вышла бы
 * в 1px сверху и в 2px снизу.
 */
.catalog-card[data-current]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border: 1px solid var(--gr-primary);
  border-radius: calc(var(--gr-radius-lg) - 1px);
  pointer-events: none;
}

/* Фокус ссылки рисуется контуром карточки: ссылка растянута на неё целиком. */
.catalog-card:has(.catalog-card-link:focus-visible) {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}

.catalog-card-link {
  color: inherit;
  text-decoration: none;
  outline: none;
}

.catalog-card-link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.catalog-card-stage {
  border-bottom: 1px solid var(--gr-brd);
}
</style>
