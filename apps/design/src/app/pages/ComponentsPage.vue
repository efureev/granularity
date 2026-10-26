<script setup lang="ts">
import { computed, ref } from 'vue'

import IconSearch from '~icons/lucide/search'

import { catalog, catalogGroups } from '../catalog'
import ComponentCard from '../component/ComponentCard.vue'
import PageHeader from '../parts/PageHeader.vue'
import { plural } from '../plural'
import { useViewedTheme } from '../viewedTheme'

const theme = useViewedTheme()

const search = ref('')
const query = computed(() => search.value.trim().toLowerCase())

const groups = computed(() => catalogGroups
  .map(group => ({
    ...group,
    items: catalog.filter(component => component.group === group.id
      && (query.value === '' || component.name.toLowerCase().includes(query.value) || component.summary.toLowerCase().includes(query.value))),
  }))
  .filter(group => group.items.length > 0))

const found = computed(() => groups.value.reduce((total, group) => total + group.items.length, 0))
</script>

<template>
  <div class="mx-auto flex max-w-[1360px] flex-col gap-10 px-4 py-10 lg:px-10">
    <PageHeader
      eyebrow="Каталог"
      title="Компоненты"
      :lead="`${plural(catalog.length, ['компонент', 'компонента', 'компонентов'])} ядра в теме «${theme.data.title}». Карточка — один образец, страница компонента — все состояния, поведение, темы рядом и токены.`"
    />

    <div class="flex flex-col gap-4">
      <GrFormField label="Найти компонент" class="max-w-[360px]">
        <GrInput v-model="search" type="search" clearable placeholder="имя или назначение">
          <template #prefix>
            <GrIcon><IconSearch /></GrIcon>
          </template>
        </GrInput>
      </GrFormField>
      <nav aria-label="Группы компонентов" class="catalog-nav flex flex-wrap gap-2">
        <a v-for="group in groups" :key="group.id" :href="`#group-${group.id}`">
          {{ group.title }} <span>{{ group.items.length }}</span>
        </a>
      </nav>
    </div>

    <section
      v-for="group in groups"
      :id="`group-${group.id}`"
      :key="group.id"
      class="catalog-group flex flex-col gap-4"
      :aria-labelledby="`group-${group.id}-title`"
    >
      <div class="flex flex-col gap-1">
        <h2 :id="`group-${group.id}-title`" class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)] tracking-[-0.01em]">
          {{ group.title }}
        </h2>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ group.lead }}
        </p>
      </div>
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <li v-for="component in group.items" :key="component.id">
          <ComponentCard :component="component" />
        </li>
      </ul>
    </section>

    <GrEmptyState
      v-if="found === 0"
      title="Ничего не нашлось"
      :description="`Нет компонентов с «${search.trim()}» в имени или назначении.`"
    />
  </div>
</template>

<style scoped>
.catalog-nav a {
  display: inline-flex;
  align-items: baseline;
  gap: var(--gr-space-1);
  padding: var(--gr-space-1) var(--gr-space-3);
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-full);
  color: var(--gr-fg);
  font-size: var(--gr-text-xs);
  line-height: var(--gr-leading-xs);
  text-decoration: none;
  transition: border-color var(--gr-duration-fast) var(--gr-ease-out);
}

.catalog-nav a span {
  color: var(--gr-muted-fg);
}

.catalog-nav a:hover {
  border-color: var(--gr-brd-hover);
}

.catalog-nav a:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}

/* Якорь группы не уходит под шапку приложения (`h-14`). */
.catalog-group {
  scroll-margin-top: calc(var(--gr-space-16) + var(--gr-space-4));
}
</style>
