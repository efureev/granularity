<script setup lang="ts">
import {computed} from 'vue'
import {RouterLink, useRoute} from 'vue-router'

import {useFintI18n} from '@feugene/fint-i18n/vue'

import {GrCard} from '@feugene/granularity'

import {
  getShowcaseComponentBySlug,
} from '../app/showcase'
import {useShowcasePageI18n} from '../app/useShowcasePageI18n'
import {useEntityI18nBlock} from '../app/useEntityI18nBlock'
import EventsTable from '../components/doc/EventsTable.vue'
import ExampleCard from '../components/doc/ExampleCard.vue'
import InfoSectionCard from '../components/doc/InfoSectionCard.vue'
import InlineRichText from '../components/content/InlineRichText.vue'
import MethodsTable from '../components/doc/MethodsTable.vue'
import PropsTable from '../components/doc/PropsTable.vue'
import SlotsTable from '../components/doc/SlotsTable.vue'
import {
  createAccessibilityItems,
  createDependencyItems,
  createRelatedLinks,
} from '../components/doc/entityPageHelpers'
import {getShowcaseComponentDoc} from '../content/componentDocs'
import {resolveDemoComponent} from '../demos/registry'

const route = useRoute()
const {t} = useFintI18n()
const {localizePageByName, localizeEntitySummary} = useShowcasePageI18n()



const componentEntity = computed(() => {
  return getShowcaseComponentBySlug(String(route.params.componentSlug ?? ''))
})

const componentDoc = computed(() => {
  if (!componentEntity.value)
    return undefined

  return getShowcaseComponentDoc(componentEntity.value)
})

// Тексты example-карточек живут в `*.examples.ts` как fallback, а переводы —
// в блоке `components.<Name>.examples.<id>.{title,description,note}`. Если ключа
// нет (компонент ещё не локализован) — показываем исходную строку из examples.ts.
const localizedExamples = computed(() => {
  const doc = componentDoc.value
  const name = componentEntity.value?.name

  if (!doc || !name)
    return []

  return doc.examples.map((example) => {
    const baseKey = `components.${name}.examples.${example.id}`
    const translate = <T extends string | undefined>(field: string, fallback: T): string | T => {
      const key = `${baseKey}.${field}`
      const result = t(key)
      return result === key ? fallback : result
    }

    return {
      ...example,
      title: translate('title', example.title),
      description: translate('description', example.description),
      note: translate('note', example.note),
    }
  })
})

// Расширенный обзор (что за компонент, для чего, чем отличается) + список фич.
// Локализуемо: `components.<Name>.overview.{paragraphs,features}` (массивы строк);
// при отсутствии переводов используем контент из override (`*.overrides.ts`).
const componentOverview = computed(() => {
  const doc = componentDoc.value
  const name = componentEntity.value?.name
  if (!doc?.overview || !name)
    return undefined

  const localizeList = (field: 'paragraphs' | 'features', fallback: string[] | undefined): string[] => {
    const key = `components.${name}.overview.${field}`
    const result = t(key)
    return Array.isArray(result) ? result as string[] : (fallback ?? [])
  }

  return {
    paragraphs: localizeList('paragraphs', doc.overview.paragraphs),
    features: localizeList('features', doc.overview.features),
    lists: doc.overview.lists ?? [],
  }
})

const accessibilityItems = computed(() => createAccessibilityItems(componentEntity.value, t))
const dependencyItems = computed(() => createDependencyItems(componentEntity.value, t))
const relatedLinks = computed(() => createRelatedLinks(componentEntity.value, t))
const componentsPage = computed(() => localizePageByName('components'))
const componentSummary = computed(() =>
  componentEntity.value ? localizeEntitySummary(componentEntity.value) : '',
)


// Блок переводов компонента (`components.<Name>`) грузится лениво при открытии
// страницы и выгружается при уходе — см. `useEntityI18nBlock`.
useEntityI18nBlock(computed(() =>
  componentEntity.value ? `components.${componentEntity.value.name}` : null,
))
</script>

<template>
  <div v-if="componentEntity && componentDoc" class="space-y-8">
    <div>
      <h1 class="max-w-4xl text-3xl font-semibold leading-tight lg:text-4xl">
        {{ componentEntity.title }}
      </h1>
      <div class="flex flex-wrap items-center gap-3 mt-5">
        <span class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
          {{ componentsPage.eyebrow }} / {{ componentEntity.group }}
        </span>
      </div>
      <div class="mt-2 space-y-4">
        <p class="showcase-text-muted max-w-3xl text-base leading-7">
          {{ componentSummary }}
        </p>
      </div>
    </div>

    <section
        v-if="componentOverview"
        id="about"
        class="scroll-mt-28 space-y-4"
    >
      <h2 class="text-2xl font-semibold">
        {{ t('showcase.detailPage.about.title') }}
      </h2>

      <div class="space-y-3 max-w-3xl">
        <p
            v-for="(paragraph, index) in componentOverview.paragraphs"
            :key="index"
            class="showcase-text-muted text-base leading-7"
        >
          <InlineRichText :text="paragraph"/>
        </p>
      </div>

      <div v-if="componentOverview.features.length" class="space-y-2">
        <h3 class="text-lg font-semibold">
          {{ t('showcase.detailPage.about.featuresTitle') }}
        </h3>
        <ul class="grid gap-2 max-w-3xl">
          <li
              v-for="(feature, index) in componentOverview.features"
              :key="index"
              class="showcase-text-muted flex items-start gap-2 text-sm leading-6"
          >
            <span class="i-lucide-check mt-1 h-4 w-4 shrink-0 text-[var(--gr-primary)]" aria-hidden="true"/>
            <span><InlineRichText :text="feature"/></span>
          </li>
        </ul>
      </div>

      <div
          v-for="(list, listIndex) in componentOverview.lists"
          :key="`list-${listIndex}`"
          class="space-y-2"
      >
        <h3 class="text-lg font-semibold">
          {{ list.title }}
        </h3>
        <ul class="grid gap-2 max-w-3xl">
          <li
              v-for="(item, index) in list.items"
              :key="index"
              class="showcase-text-muted flex items-start gap-2 text-sm leading-6"
          >
            <span class="i-lucide-dot mt-1 h-4 w-4 shrink-0 text-[var(--gr-primary)]" aria-hidden="true"/>
            <span><InlineRichText :text="item"/></span>
          </li>
        </ul>
      </div>
    </section>

    <section id="live-examples" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          {{ t('showcase.detailPage.liveExamples.title') }}
        </h2>
        <p class="showcase-text-muted text-sm leading-6">
          {{ t('showcase.detailPage.liveExamples.descriptionComponent') }}
        </p>
      </div>

      <div class="grid gap-6">
        <ExampleCard
            v-for="example in localizedExamples"
            :key="example.id"
            :title="example.title"
            :description="example.description"
            :preview-key="example.previewKey"
            :code="example.code"
            :hide-code="example.hideCode"
            :note="example.note"
        >
          <template v-if="resolveDemoComponent(example.previewKey)" #preview>
            <component :is="resolveDemoComponent(example.previewKey)"/>
          </template>
        </ExampleCard>
      </div>
    </section>

    <section id="api" class="scroll-mt-28 space-y-4">
      <h2 class="text-2xl font-semibold">
        {{ t('showcase.detailPage.api.title') }}
      </h2>
      <div class="grid gap-4">
        <PropsTable :items="componentEntity.apiSections.find(section => section.key === 'props')?.items ?? []"/>
        <SlotsTable :items="componentEntity.apiSections.find(section => section.key === 'slots')?.items ?? []"/>
        <EventsTable :items="componentEntity.apiSections.find(section => section.key === 'events')?.items ?? []"/>
        <MethodsTable :items="componentEntity.apiSections.find(section => section.key === 'methods')?.items ?? []"/>
      </div>
    </section>

    <section id="integration-notes" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          {{ t('showcase.detailPage.implementationNotes.title') }}
        </h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          {{ t('showcase.detailPage.implementationNotes.description') }}
        </p>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <InfoSectionCard :title="t('showcase.detailPage.info.accessibilityTitle')" :items="accessibilityItems"
                         variant="list"/>
        <InfoSectionCard :title="t('showcase.detailPage.info.dependenciesTitle')" :items="dependencyItems"
                         variant="chips"/>
        <InfoSectionCard :title="t('showcase.detailPage.info.relatedLinksTitle')" :links="relatedLinks"
                         variant="links"/>
      </div>
    </section>
  </div>

  <GrCard
      v-else
      class="showcase-panel rounded-3xl border p-8"
  >
    <h1 class="text-3xl font-semibold">
      {{ t('showcase.detailPage.notFoundComponent.title') }}
    </h1>
    <p class="showcase-text-muted mt-4 max-w-2xl text-sm leading-6">
      {{ t('showcase.detailPage.notFoundComponent.description') }}
    </p>
    <RouterLink
        to="/components"
        class="showcase-link-chip mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
    >
      {{ t('showcase.detailPage.notFoundComponent.action') }}
    </RouterLink>
  </GrCard>
</template>