<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import type { CatalogComponent } from '../catalog'
import { previewOf } from './views'

const props = defineProps<{ component: CatalogComponent }>()

const preview = computed(() => previewOf(props.component))
</script>

<template>
  <article class="component-card">
    <!-- Образец не интерактивен: карточка целиком — ссылка, контролы внутри ссылки недопустимы. -->
    <div class="component-card-stage" inert>
      <component :is="preview" v-if="preview" />
    </div>
    <div class="flex flex-col gap-1 px-4 pb-4 pt-3">
      <RouterLink class="component-card-link" :to="{ name: 'component', params: { component: component.id } }">
        {{ component.name }}
      </RouterLink>
      <p class="component-card-summary">
        {{ component.summary }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.component-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-lg);
  background: var(--gr-card);
  transition: border-color var(--gr-duration-fast) var(--gr-ease-out);
}

.component-card:hover {
  border-color: var(--gr-brd-hover);
}

.component-card:has(.component-card-link:focus-visible) {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}

.component-card-stage {
  isolation: isolate;
  display: flex;
  height: calc(var(--gr-space-32) + var(--gr-space-4));
  flex-direction: column;
  justify-content: center;
  gap: var(--gr-space-3);
  overflow: hidden;
  padding: var(--gr-space-4) var(--gr-space-5);
  border-bottom: 1px solid var(--gr-brd);
  background: var(--gr-bg);
  color: var(--gr-fg);
}

.component-card-link {
  color: var(--gr-fg);
  font-size: var(--gr-text-base);
  font-weight: var(--gr-font-semibold);
  line-height: var(--gr-leading-base);
  text-decoration: none;
  outline: none;
}

/* Ссылка растянута на всю карточку: щелчок по образцу ведёт на страницу компонента. */
.component-card-link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.component-card-summary {
  display: -webkit-box;
  overflow: hidden;
  color: var(--gr-muted-fg);
  font-size: var(--gr-text-sm);
  line-height: var(--gr-leading-sm);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
