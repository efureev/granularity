<script setup lang="ts">
import { GrCard } from '@feugene/granularity'

import ShowcasePageHero from '../showcase/ShowcasePageHero.vue'
import InlineRichText from '../content/InlineRichText.vue'
import type { ShowcaseApiSectionMeta, ShowcaseExampleMeta } from '../../content/model'
import type { ShowcaseRelatedLink } from './entityPageHelpers'
import EventsTable from './EventsTable.vue'
import ExampleCard from './ExampleCard.vue'
import InfoSectionCard from './InfoSectionCard.vue'
import MethodsTable from './MethodsTable.vue'
import PropsTable from './PropsTable.vue'
import SlotsTable from './SlotsTable.vue'

defineProps<{
  eyebrow: string
  title: string
  description: string
  status: string
  sections: { id: string; title: string; description: string; bullets: string[] }[]
  examples?: ShowcaseExampleMeta[]
  usageCode?: string
  accessibilityItems?: string[]
  dependencyItems?: string[]
  relatedLinks?: ShowcaseRelatedLink[]
  apiSections?: ShowcaseApiSectionMeta[]
}>()
</script>

<template>
  <div class="space-y-8">
    <ShowcasePageHero
      :eyebrow="eyebrow"
      :title="title"
    >
      <template #description>
        <InlineRichText :text="description" />
      </template>
    </ShowcasePageHero>

    <section class="grid gap-6">
      <GrCard
        v-for="section in sections"
        :id="section.id"
        :key="section.id"
        class="showcase-panel scroll-mt-28 rounded-3xl border p-6"
      >
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-semibold leading-tight">
              {{ section.title }}
            </h2>
            <a :href="`#${section.id}`" class="showcase-link-chip inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] transition-colors">
              {{ $t('showcase.detailPage.sectionAnchorLink') }}
            </a>
          </div>

          <p class="showcase-text-muted max-w-3xl text-sm leading-6">
            <InlineRichText :text="section.description" />
          </p>
        </div>

        <ul class="mt-6 grid gap-3">
          <li v-for="bullet in section.bullets" :key="bullet" class="showcase-inline-surface rounded-2xl border px-4 py-3 text-sm leading-6">
            <InlineRichText :text="bullet" />
          </li>
        </ul>
      </GrCard>
    </section>

    <section v-if="examples?.length" class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">{{ $t('showcase.detailPage.liveExamples.title') }}</h2>
        <p class="showcase-text-muted text-sm leading-6">
          {{ $t('showcase.detailPage.liveExamples.descriptionGeneric') }}
        </p>
      </div>

      <div class="grid gap-6">
        <ExampleCard
          v-for="example in examples"
          :key="example.id"
          :title="example.title"
          :description="example.description"
          :code="usageCode"
          :note="$t('showcase.detailPage.docPageExampleNote')"
        />
      </div>
    </section>

    <section id="api" class="space-y-4">
      <h2 class="text-2xl font-semibold">{{ $t('showcase.detailPage.api.title') }}</h2>
      <div class="grid gap-4">
        <PropsTable :items="apiSections?.find(section => section.key === 'props')?.items ?? []" />
        <SlotsTable :items="apiSections?.find(section => section.key === 'slots')?.items ?? []" />
        <EventsTable :items="apiSections?.find(section => section.key === 'events')?.items ?? apiSections?.find(section => section.key === 'parameters')?.items ?? []" />
        <MethodsTable :items="apiSections?.find(section => section.key === 'methods')?.items ?? apiSections?.find(section => section.key === 'returns')?.items ?? []" />
      </div>
    </section>

    <section class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">{{ $t('showcase.detailPage.implementationNotes.title') }}</h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          {{ $t('showcase.detailPage.implementationNotes.description') }}
        </p>
      </div>

      <div class="grid gap-4">
        <InfoSectionCard :title="$t('showcase.detailPage.info.accessibilityTitle')" :items="accessibilityItems" variant="list" />
        <InfoSectionCard :title="$t('showcase.detailPage.info.dependenciesTitle')" :items="dependencyItems" variant="chips" />
        <InfoSectionCard :title="$t('showcase.detailPage.info.relatedLinksTitle')" :links="relatedLinks" variant="links" />
      </div>
    </section>
  </div>
</template>