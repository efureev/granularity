<script setup lang="ts">
import { DsCard } from '@feugene/granularity'

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
    <DsCard class="showcase-panel rounded-3xl border p-8">
      <div class="flex flex-wrap items-center gap-3">
        <span class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
          {{ eyebrow }}
        </span>
      </div>

      <div class="mt-5 space-y-4">
        <h1 class="max-w-4xl text-4xl font-semibold leading-tight lg:text-5xl">
          {{ title }}
        </h1>
        <p class="showcase-text-muted max-w-3xl text-base leading-7">
          <InlineRichText :text="description" />
        </p>
      </div>
    </DsCard>

    <section class="grid gap-6">
      <DsCard
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
              link
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
      </DsCard>
    </section>

    <section v-if="examples?.length" class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">Live examples</h2>
        <p class="showcase-text-muted text-sm leading-6">
          Наглядные сценарии использования без лишних пояснений.
        </p>
      </div>

      <div class="grid gap-6">
        <ExampleCard
          v-for="example in examples"
          :key="example.id"
          :title="example.title"
          :description="example.description"
          :code="usageCode"
          note="На следующих этапах эта карточка получит живой preview и source snippet конкретного сценария."
        />
      </div>
    </section>

    <section id="api" class="space-y-4">
      <h2 class="text-2xl font-semibold">API</h2>
      <div class="grid gap-4">
        <PropsTable :items="apiSections?.find(section => section.key === 'props')?.items ?? []" />
        <SlotsTable :items="apiSections?.find(section => section.key === 'slots')?.items ?? []" />
        <EventsTable :items="apiSections?.find(section => section.key === 'events')?.items ?? apiSections?.find(section => section.key === 'parameters')?.items ?? []" />
        <MethodsTable :items="apiSections?.find(section => section.key === 'methods')?.items ?? apiSections?.find(section => section.key === 'returns')?.items ?? []" />
      </div>
    </section>

    <section class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">Implementation notes</h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          Дополнительные заметки по доступности, зависимостям и связанным материалам.
        </p>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <InfoSectionCard title="Accessibility" :items="accessibilityItems" variant="list" />
        <InfoSectionCard title="Dependencies" :items="dependencyItems" variant="chips" />
        <InfoSectionCard title="Related links" :links="relatedLinks" variant="links" />
      </div>
    </section>
  </div>
</template>