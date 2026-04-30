<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import IconArrowLeft from '~icons/lucide/arrow-left'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import { GrBadge, GrCard } from '@feugene/granularity'

import ShowcasePageHero from '../components/showcase/ShowcasePageHero.vue'
import {
  getShowcaseEntityByPath,
  getShowcasePageByPath,
} from '../app/showcase'
import { useShowcasePageI18n } from '../app/useShowcasePageI18n'
import CodeBlock from '../components/doc/CodeBlock.vue'
import ApiTable from '../components/doc/ApiTable.vue'
import ExampleCard from '../components/doc/ExampleCard.vue'
import InfoSectionCard from '../components/doc/InfoSectionCard.vue'
import {
  createDependencyItems,
  createUsageSnippet,
} from '../components/doc/entityPageHelpers'
import PackagePreviewDemo from '../demos/package/PackagePreviewDemo.vue'
import { getShowcasePackageDoc } from '../content/packageDocs'

const route = useRoute()
const { t } = useFintI18n()
const { localizePage, localizePageByName } = useShowcasePageI18n()

const entity = computed(() => {
  const resolved = getShowcaseEntityByPath(route.path)
  if (!resolved || resolved.kind === 'component')
    return undefined

  return resolved
})

const page = computed(() => {
  const currentPage = getShowcasePageByPath(route.path)

  return currentPage ? localizePage(currentPage) : undefined
})
const entityDoc = computed(() => entity.value ? getShowcasePackageDoc(entity.value) : undefined)
const usageSnippet = computed(() => createUsageSnippet(entity.value))
const dependencyItems = computed(() => createDependencyItems(entity.value))

const pageEyebrow = computed(() => page.value?.eyebrow ?? localizePageByName('overview').eyebrow)
</script>

<template>
  <div v-if="entity && entityDoc && page" class="space-y-8">
    <div class="showcase-text-subtle flex items-center gap-3 text-sm">
      <RouterLink :to="page.path" class="inline-flex items-center gap-2 font-medium transition-colors hover:text-[var(--fg)]">
        <IconArrowLeft class="h-4 w-4 shrink-0" />
        <span>{{ t('showcase.detailPage.backTo', { target: page.shortTitle.toLowerCase() }) }}</span>
      </RouterLink>
      <span>/</span>
      <span>{{ entity.title }}</span>
    </div>

    <ShowcasePageHero
      :eyebrow="`${pageEyebrow} / ${entity.group}`"
      :title="entity.title"
      :description="entity.summary"
    >
      <template v-if="entity.tags?.length" #actions>
        <GrBadge v-for="tag in entity.tags" :key="tag">
          {{ tag }}
        </GrBadge>
      </template>
    </ShowcasePageHero>

    <section id="overview" class="scroll-mt-28">
      <GrCard class="showcase-panel rounded-3xl border p-6">
        <h2 class="text-2xl font-semibold">
          {{ t('showcase.detailPage.packageOverview.title') }}
        </h2>
        <ul class="showcase-text-muted mt-6 grid gap-3 text-sm leading-6">
          <li v-for="item in entityDoc.overview" :key="item">
            {{ item }}
          </li>
        </ul>
      </GrCard>
    </section>

    <section id="examples" class="scroll-mt-28 space-y-4">
      <div>
        <h2 class="text-2xl font-semibold">
          {{ t('showcase.detailPage.liveExamples.title') }}
        </h2>
        <p class="showcase-text-muted mt-2 max-w-3xl text-sm leading-6">
          {{ t('showcase.detailPage.liveExamples.descriptionPackage') }}
        </p>
      </div>

      <div class="grid gap-6">
        <ExampleCard
          v-for="example in entityDoc.examples"
          :key="example.id"
          :title="example.title"
          :description="example.description"
          :code="example.code"
          :note="example.note"
        >
          <template #preview>
            <PackagePreviewDemo
              v-if="example.previewKey"
              :preview-key="example.previewKey"
            />
            <div v-else class="showcase-text-subtle text-sm">
              {{ t('showcase.detailPage.preview.fallbackPackage') }}
            </div>
          </template>
        </ExampleCard>
      </div>
    </section>

    <section id="api" class="scroll-mt-28 space-y-4">
      <div>
        <h2 class="text-2xl font-semibold">
          {{ t('showcase.detailPage.api.title') }}
        </h2>
        <p class="showcase-text-muted mt-2 max-w-3xl text-sm leading-6">
          {{ t('showcase.detailPage.api.descriptionPackage') }}
        </p>
      </div>

      <div class="grid gap-4">
        <ApiTable
          v-for="section in entityDoc.apiSections"
          :key="section.key"
          :title="section.title"
          :items="section.items"
          :empty-label="t('showcase.docComponents.emptyLabel.generic')"
        />
      </div>
    </section>

    <section id="usage" class="scroll-mt-28 space-y-4">
      <CodeBlock
        :code="usageSnippet"
        language="ts"
        :title="t('showcase.detailPage.usage.canonicalTitle')"
      />

      <div class="grid gap-4 md:grid-cols-2">
        <InfoSectionCard :title="t('showcase.detailPage.usage.usageTitle')" :items="entityDoc.usage" />
        <InfoSectionCard :title="t('showcase.detailPage.usage.caveatsTitle')" :items="entityDoc.caveats" />
      </div>
    </section>

    <section id="integration" class="scroll-mt-28">
      <div class="grid gap-4 md:grid-cols-2">
        <InfoSectionCard :title="t('showcase.detailPage.integration.notesTitle')" :items="entityDoc.integrationNotes" />
        <InfoSectionCard :title="t('showcase.detailPage.integration.dependenciesTitle')" :items="dependencyItems" />
      </div>
    </section>
  </div>

  <GrCard
    v-else
    class="showcase-empty-state rounded-3xl border border-dashed p-8 text-sm leading-6 shadow-sm"
  >
    <h1 class="text-3xl font-semibold">
      {{ t('showcase.detailPage.notFoundEntity.title') }}
    </h1>
    <p class="mt-4 max-w-2xl text-sm leading-6">
      {{ t('showcase.detailPage.notFoundEntity.description') }}
    </p>
    <div class="mt-6 flex flex-wrap gap-2">
      <RouterLink to="/directives" class="showcase-link-chip inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors">
        {{ t('showcase.detailPage.notFoundEntity.goDirectives') }}
      </RouterLink>
      <RouterLink to="/composables" class="showcase-link-chip inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors">
        {{ t('showcase.detailPage.notFoundEntity.goComposables') }}
      </RouterLink>
      <RouterLink to="/utilities" class="showcase-link-chip inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors">
        {{ t('showcase.detailPage.notFoundEntity.goUtilities') }}
      </RouterLink>
    </div>
  </GrCard>
</template>
