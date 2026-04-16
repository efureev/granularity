<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import IconArrowRight from '~icons/lucide/arrow-right'

import { DsCard } from '@feugene/granularity'

import { useShowcasePageI18n } from '../../app/useShowcasePageI18n'
import type { ShowcaseEntityKind, ShowcaseEntityRegistryItem } from '../../content/model'
import type { ShowcasePage } from '../../app/showcase'

const props = defineProps<{
  kind: ShowcaseEntityKind
  page: ShowcasePage
  entities: ShowcaseEntityRegistryItem[]
}>()

const { getEntityGroupLabel } = useShowcasePageI18n()

const searchQuery = ref('')

const filteredEntities = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query)
    return props.entities

  return props.entities.filter((entity) => {
    return [entity.name, entity.summary, entity.group]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
})

const groupedEntities = computed(() => {
  const buckets = new Map<string, ShowcaseEntityRegistryItem[]>()

  for (const entity of filteredEntities.value) {
    const group = entity.group || 'ungrouped'
    const current = buckets.get(group) ?? []
    current.push(entity)
    buckets.set(group, current)
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => getEntityGroupLabel(props.page.name, left).localeCompare(getEntityGroupLabel(props.page.name, right)))
    .map(([group, entities]) => ({
      group,
      label: getEntityGroupLabel(props.page.name, group),
      entities: [...entities].sort((left, right) => left.title.localeCompare(right.title)),
    }))
})
</script>

<template>
  <div class="space-y-8">
    <DsCard class="showcase-panel rounded-3xl border p-8">
      <div class="space-y-4">
        <span class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
          {{ page.eyebrow }}
        </span>
        <h1 class="max-w-4xl text-4xl font-semibold leading-tight lg:text-5xl">
          {{ page.title }} {{ $t('showcase.packageCatalog.titleSuffix') }}
        </h1>
        <p class="showcase-text-muted max-w-3xl text-base leading-7">
          {{ page.description }} {{ $t('showcase.packageCatalog.heroDescription') }}
        </p>
      </div>
    </DsCard>

    <section id="catalog" class="scroll-mt-28 space-y-5">
      <div class="showcase-panel rounded-3xl border p-4">
        <label class="grid gap-2 text-sm font-medium">
          {{ $t('showcase.packageCatalog.searchLabel') }}
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="$t('showcase.packageCatalog.searchPlaceholder')"
            class="showcase-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
          >
        </label>
      </div>

      <div class="space-y-6">
        <section
          v-for="bucket in groupedEntities"
          :key="bucket.group"
          class="space-y-4"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-2xl font-semibold">
                {{ bucket.label }}
              </h2>
              <p class="showcase-text-subtle text-sm">
                {{ bucket.entities.length }} {{ $t('showcase.packageCatalog.itemsCount') }}
              </p>
            </div>
          </div>

          <div class="grid gap-4 xl:grid-cols-2">
            <RouterLink
              v-for="entity in bucket.entities"
              :key="entity.id"
              :to="entity.path"
              class="block"
            >
              <DsCard class="showcase-card-link h-full rounded-3xl border p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="showcase-link-chip rounded-full border px-3 py-1 text-xs">
                    {{ entity.kind }}
                  </span>
                </div>

                <h3 class="showcase-card-link-title mt-4 text-xl font-semibold">
                  {{ entity.title }}
                </h3>
                <p class="showcase-text-muted mt-3 text-sm leading-6">
                  {{ entity.summary }}
                </p>

                <div class="showcase-text-primary mt-5 inline-flex items-center gap-2 text-sm font-medium">
                  <span>{{ $t('showcase.packageCatalog.openDetailPage') }}</span>
                  <IconArrowRight class="h-4 w-4 shrink-0" />
                </div>
              </DsCard>
            </RouterLink>
          </div>
        </section>

        <DsCard
          v-if="groupedEntities.length === 0"
          class="showcase-empty-state rounded-3xl border border-dashed p-8 text-sm leading-6 shadow-sm"
        >
          {{ $t('showcase.packageCatalog.emptyState') }}
        </DsCard>
      </div>
    </section>
  </div>
</template>