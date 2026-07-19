<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import { GrBadge } from '@feugene/granularity'

import CodeBlock from '../components/doc/CodeBlock.vue'
import ExampleCard from '../components/doc/ExampleCard.vue'
import EventsTable from '../components/doc/EventsTable.vue'
import PropsTable from '../components/doc/PropsTable.vue'
import SlotsTable from '../components/doc/SlotsTable.vue'
import { getCompanionComponentBySlug } from '../content/companion/companionPackages'
import type { ShowcaseApiItemMeta } from '../content/model'
import IconArrowLeft from '~icons/lucide/arrow-left'

const route = useRoute()
const { t } = useFintI18n()

// Локальный preview-реестр companion-демо (изолирован от core `ComponentDetailPage`).
const previewRegistry = {
  'extra-datepicker-modes': defineAsyncComponent(() => import('../demos/extra/granularity-datepicker/GrDateTimePickerModesDemo.vue')),
  'extra-datepicker-localized': defineAsyncComponent(() => import('../demos/extra/granularity-datepicker/GrDateTimePickerLocalizedDemo.vue')),
  'extra-date-basic': defineAsyncComponent(() => import('../demos/extra/granularity-datepicker/GrDatePickerBasicDemo.vue')),
  'extra-time-basic': defineAsyncComponent(() => import('../demos/extra/granularity-datepicker/GrTimePickerBasicDemo.vue')),
  'extra-date-range': defineAsyncComponent(() => import('../demos/extra/granularity-datepicker/GrDateRangePickerDemo.vue')),
} as const

const component = computed(() => getCompanionComponentBySlug(String(route.params.componentSlug ?? '')))

const importCode = computed(() =>
  component.value ? `import { ${component.value.name} } from '${component.value.importPath}'` : '',
)

function sectionItems(key: string): ShowcaseApiItemMeta[] {
  return component.value?.apiSections.find(section => section.key === key)?.items ?? []
}

function resolvePreviewComponent(previewKey?: string) {
  if (!previewKey)
    return undefined
  return previewRegistry[previewKey as keyof typeof previewRegistry]
}
</script>

<template>
  <div v-if="component" class="space-y-8">
    <div>
      <div class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
        {{ t('showcase.pages.extras.eyebrow') }} / {{ component.packageLabel }}
      </div>
      <h1 class="mt-3 max-w-4xl text-3xl font-semibold leading-tight lg:text-4xl">
        {{ component.title }}
      </h1>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <code class="showcase-link-chip rounded-full border px-3 py-1 text-xs">{{ component.npmName }}</code>
        <GrBadge tone="azure">{{ t('showcase.extraDetailPage.companionBadge') }}</GrBadge>
      </div>
      <p class="showcase-text-muted mt-4 max-w-3xl text-base leading-7">
        {{ component.summary }}
      </p>

      <CodeBlock
        class="mt-5"
        :code="importCode"
        language="ts"
        :title="t('showcase.extraDetailPage.importTitle')"
      />
    </div>

    <section id="live-examples" class="scroll-mt-28 space-y-4">
      <h2 class="text-2xl font-semibold">
        {{ t('showcase.detailPage.liveExamples.title') }}
      </h2>

      <div class="grid gap-6">
        <ExampleCard
          v-for="example in component.examples"
          :key="example.id"
          :title="example.title"
          :description="example.description"
          :code="example.code"
          :note="example.note"
        >
          <template v-if="resolvePreviewComponent(example.previewKey)" #preview>
            <component :is="resolvePreviewComponent(example.previewKey)" />
          </template>
        </ExampleCard>
      </div>
    </section>

    <section id="api" class="scroll-mt-28 space-y-4">
      <h2 class="text-2xl font-semibold">
        {{ t('showcase.detailPage.api.title') }}
      </h2>
      <div class="grid gap-4">
        <PropsTable :items="sectionItems('props')" />
        <EventsTable :items="sectionItems('events')" />
        <SlotsTable :items="sectionItems('slots')" />
      </div>
    </section>

    <RouterLink to="/extras" class="showcase-card-link inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm">
      <IconArrowLeft class="h-4 w-4" aria-hidden="true" />
      {{ t('showcase.extraDetailPage.backToExtras') }}
    </RouterLink>
  </div>

  <div v-else class="showcase-empty-state rounded-3xl border border-dashed px-5 py-10 text-sm leading-6">
    {{ t('showcase.extraDetailPage.notFound') }}
    <RouterLink to="/extras" class="underline">{{ t('showcase.extraDetailPage.notFoundLink') }}</RouterLink>
  </div>
</template>
