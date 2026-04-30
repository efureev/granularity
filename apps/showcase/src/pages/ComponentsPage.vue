<script setup lang="ts">
import {computed, ref} from 'vue'
import {RouterLink} from 'vue-router'

import {GrCard} from '@feugene/granularity'

import ShowcasePageHero from '../components/showcase/ShowcasePageHero.vue'
import {showcaseComponentEntities} from '../app/showcase'
import {useShowcasePageI18n} from '../app/useShowcasePageI18n'
import {GrBadge} from "@feugene/granularity";

const {
  getEntityGroupLabel,
  localizePageByName,
} = useShowcasePageI18n()

const page = computed(() => localizePageByName('components'))

const searchQuery = ref('')

const filteredComponents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query)
    return showcaseComponentEntities

  return showcaseComponentEntities.filter((entity) => {
    return [entity.name, entity.summary, entity.group]
        .join(' ')
        .toLowerCase()
        .includes(query)
  })
})

const componentsWithExamples = computed(() => showcaseComponentEntities.filter(entity => entity.examples.length > 0))

const groupedComponents = computed(() => {
  const buckets = new Map<string, typeof showcaseComponentEntities>()

  for (const entity of filteredComponents.value) {
    const group = entity.group || 'misc'
    const currentGroup = buckets.get(group) ?? []
    currentGroup.push(entity)
    buckets.set(group, currentGroup)
  }

  return [...buckets.entries()]
      .sort(([left], [right]) => getEntityGroupLabel('components', left).localeCompare(getEntityGroupLabel('components', right)))
      .map(([group, entities]) => ({
        group,
        label: getEntityGroupLabel('components', group),
        entities: [...entities].sort((left, right) => left.title.localeCompare(right.title)),
      }))
})

</script>

<template>
  <div class="space-y-8">
    <ShowcasePageHero
        :eyebrow="page.eyebrow"
        :title="$t('showcase.componentsPage.heroTitle')"
        :description="$t('showcase.componentsPage.heroDescription')"
    />

    <section id="catalog" class="scroll-mt-28 space-y-5">
      <GrCard class="showcase-panel rounded-3xl border p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold">
              {{ $t('showcase.componentsPage.catalogTitle') }}
            </h2>
            <p class="showcase-text-muted max-w-3xl text-sm leading-6">
              {{ $t('showcase.componentsPage.catalogDescription') }}
              <GrBadge tone="azure">{{ componentsWithExamples.length }}</GrBadge>
            </p>
          </div>

          <label class="block w-full max-w-md">
            <span class="showcase-kicker mb-2 block text-xs font-semibold">
              {{ $t('showcase.componentsPage.searchLabel') }}
            </span>
            <input
                v-model="searchQuery"
                type="search"
                :placeholder="$t('showcase.componentsPage.searchPlaceholder')"
                class="showcase-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors"
            >
          </label>
        </div>

        <div class="mt-6 space-y-8">
          <div
              v-for="group in groupedComponents"
              :key="group.group"
              class="space-y-4"
          >
            <div class="flex items-center gap-3">
              <h3 class="text-xl font-semibold">
                {{ group.label }}
              </h3>
              <span class="showcase-text-subtle text-sm">
                {{ group.entities.length }}
              </span>
            </div>

            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <RouterLink
                  v-for="component in group.entities"
                  :key="component.id"
                  :to="component.path"
                  class="showcase-card-link group block rounded-3xl border p-5 transition-colors"
              >
                <div class="flex items-start gap-3">
                  <div>
                    <p class="showcase-card-link-title text-lg font-semibold transition-colors">
                      {{ component.title }}
                    </p>
                    <p class="showcase-text-muted mt-2 text-sm leading-6">
                      {{ component.summary }}
                    </p>
                  </div>
                </div>

                <div class="showcase-text-subtle mt-4 flex flex-wrap gap-2 text-xs">
                  <span class="showcase-link-chip rounded-full border px-3 py-1">
                    {{ getEntityGroupLabel('components', component.group || 'misc') }}
                  </span>
                </div>
              </RouterLink>
            </div>
          </div>

          <div
              v-if="groupedComponents.length === 0"
              class="showcase-empty-state rounded-3xl border border-dashed px-5 py-8 text-sm leading-6"
          >
            {{ $t('showcase.componentsPage.emptyState') }}
          </div>
        </div>
      </GrCard>
    </section>
  </div>
</template>