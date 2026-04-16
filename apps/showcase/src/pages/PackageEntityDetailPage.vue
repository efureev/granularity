<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import IconArrowLeft from '~icons/lucide/arrow-left'

import { DsBadge, DsCard } from '@feugene/granularity'

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
        <span>Back to {{ page.shortTitle.toLowerCase() }}</span>
      </RouterLink>
      <span>/</span>
      <span>{{ entity.title }}</span>
    </div>

    <DsCard class="showcase-panel rounded-3xl border p-8">
      <div class="flex flex-wrap items-center gap-3">
        <span class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
          {{ pageEyebrow }} / {{ entity.group }}
        </span>
      </div>

      <div class="mt-5 space-y-4">
        <h1 class="max-w-4xl text-4xl font-semibold leading-tight lg:text-5xl">
          {{ entity.title }}
        </h1>
        <p class="showcase-text-muted max-w-3xl text-base leading-7">
          {{ entity.summary }}
        </p>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <DsBadge v-for="tag in entity.tags" :key="tag">
          {{ tag }}
        </DsBadge>
      </div>
    </DsCard>

    <section id="overview" class="scroll-mt-28">
      <DsCard class="showcase-panel rounded-3xl border p-6">
        <h2 class="text-2xl font-semibold">
          Package overview
        </h2>
        <ul class="showcase-text-muted mt-6 grid gap-3 text-sm leading-6">
          <li v-for="item in entityDoc.overview" :key="item">
            {{ item }}
          </li>
        </ul>
      </DsCard>
    </section>

    <section id="examples" class="scroll-mt-28 space-y-4">
      <div>
        <h2 class="text-2xl font-semibold">
          Live examples
        </h2>
        <p class="showcase-text-muted mt-2 max-w-3xl text-sm leading-6">
          Отдельные сценарии помогают быстро понять, как использовать сущность в интерфейсе.
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
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
              Preview area reserved for the next iteration.
            </div>
          </template>
        </ExampleCard>
      </div>
    </section>

    <section id="api" class="scroll-mt-28 space-y-4">
      <div>
        <h2 class="text-2xl font-semibold">
          API
        </h2>
        <p class="showcase-text-muted mt-2 max-w-3xl text-sm leading-6">
          Главное по параметрам и контракту использования собрано в одном месте.
        </p>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <ApiTable
          v-for="section in entityDoc.apiSections"
          :key="section.key"
          :title="section.title"
          :items="section.items"
          empty-label="API details for this section are not connected yet."
        />
      </div>
    </section>

    <section id="usage" class="scroll-mt-28 space-y-4">
      <CodeBlock
        :code="usageSnippet"
        language="ts"
        title="Canonical usage"
      />

      <div class="grid gap-4 xl:grid-cols-2">
        <InfoSectionCard title="Usage" :items="entityDoc.usage" />
        <InfoSectionCard title="Caveats" :items="entityDoc.caveats" />
      </div>
    </section>

    <section id="integration" class="scroll-mt-28">
      <div class="grid gap-4 xl:grid-cols-3">
        <InfoSectionCard title="Integration notes" :items="entityDoc.integrationNotes" />
        <InfoSectionCard title="Dependencies" :items="dependencyItems" />
      </div>
    </section>
  </div>

  <DsCard
    v-else
    class="showcase-empty-state rounded-3xl border border-dashed p-8 text-sm leading-6 shadow-sm"
  >
    <h1 class="text-3xl font-semibold">
      Package entity not found
    </h1>
    <p class="mt-4 max-w-2xl text-sm leading-6">
      Похоже, detail route не совпал с текущим registry пакета. Вернитесь в один из package-level разделов и выберите существующую сущность.
    </p>
    <div class="mt-6 flex flex-wrap gap-2">
      <RouterLink to="/directives" class="showcase-link-chip inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors">
        Перейти в directives
      </RouterLink>
      <RouterLink to="/composables" class="showcase-link-chip inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors">
        Перейти в composables
      </RouterLink>
      <RouterLink to="/utilities" class="showcase-link-chip inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors">
        Перейти в utilities
      </RouterLink>
    </div>
  </DsCard>
</template>