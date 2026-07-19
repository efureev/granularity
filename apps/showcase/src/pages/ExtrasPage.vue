<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { GrBadge, GrCard } from '@feugene/granularity'

import ShowcasePageHero from '../components/showcase/ShowcasePageHero.vue'
import { companionPackages } from '../content/companion/companionPackages'
import { useShowcasePageI18n } from '../app/useShowcasePageI18n'

const { localizePageByName } = useShowcasePageI18n()
const page = computed(() => localizePageByName('extras'))

const searchQuery = ref('')

const filteredPackages = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return companionPackages
    .map((pkg) => {
      if (!query)
        return pkg

      const components = pkg.components.filter(component =>
        [component.name, component.summary].join(' ').toLowerCase().includes(query),
      )

      return { ...pkg, components }
    })
    .filter(pkg => pkg.components.length > 0)
})

const totalComponents = computed(() =>
  companionPackages.reduce((sum, pkg) => sum + pkg.components.length, 0),
)
</script>

<template>
  <div class="space-y-8">
    <ShowcasePageHero
      :eyebrow="page.eyebrow"
      :title="page.title"
      :description="page.description"
    />

    <section id="catalog" class="scroll-mt-28 space-y-5">
      <GrCard class="showcase-panel rounded-3xl border p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold">
              {{ $t('showcase.extrasPage.catalogTitle') }}
            </h2>
            <p class="showcase-text-muted max-w-3xl text-sm leading-6">
              {{ $t('showcase.extrasPage.catalogDescription') }}
              <GrBadge tone="azure">{{ totalComponents }}</GrBadge>
            </p>
          </div>

          <label class="block w-full max-w-md">
            <span class="showcase-kicker mb-2 block text-xs font-semibold">
              {{ $t('showcase.extrasPage.searchLabel') }}
            </span>
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="$t('showcase.extrasPage.searchPlaceholder')"
              class="showcase-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors"
            >
          </label>
        </div>

        <div class="mt-6 space-y-10">
          <div
            v-for="pkg in filteredPackages"
            :key="pkg.id"
            class="space-y-4"
          >
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-3">
                <h3 class="text-xl font-semibold">
                  {{ pkg.label }}
                </h3>
                <code class="showcase-link-chip rounded-full border px-3 py-1 text-xs">{{ pkg.npmName }}</code>
                <GrBadge tone="neutral">v{{ pkg.version }}</GrBadge>
              </div>
              <p class="showcase-text-muted max-w-3xl text-sm leading-6">
                {{ pkg.description }}
              </p>
              <div class="showcase-text-subtle flex flex-wrap items-center gap-2 text-xs">
                <span class="opacity-70">{{ $t('showcase.extrasPage.depsLabel') }}</span>
                <code
                  v-for="dep in pkg.dependencies"
                  :key="dep"
                  class="showcase-link-chip rounded-full border px-3 py-1"
                >{{ dep }}</code>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <RouterLink
                v-for="component in pkg.components"
                :key="component.slug"
                :to="`/extras/${component.slug}`"
                class="showcase-card-link group block rounded-3xl border p-5 transition-colors"
              >
                <p class="showcase-card-link-title text-lg font-semibold transition-colors">
                  {{ component.title }}
                </p>
                <p class="showcase-text-muted mt-2 text-sm leading-6">
                  {{ component.summary }}
                </p>
                <div class="showcase-text-subtle mt-4 flex flex-wrap gap-2 text-xs">
                  <span class="showcase-link-chip rounded-full border px-3 py-1">
                    {{ pkg.label }}
                  </span>
                </div>
              </RouterLink>
            </div>
          </div>

          <div
            v-if="filteredPackages.length === 0"
            class="showcase-empty-state rounded-3xl border border-dashed px-5 py-8 text-sm leading-6"
          >
            {{ $t('showcase.extrasPage.emptyState') }}
          </div>
        </div>
      </GrCard>
    </section>
  </div>
</template>
