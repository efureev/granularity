<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import { GrBadge } from '@feugene/granularity'

import ApiTable from '../components/doc/ApiTable.vue'
import CodeBlock from '../components/doc/CodeBlock.vue'
import ExampleCard from '../components/doc/ExampleCard.vue'
import InlineRichText from '../components/content/InlineRichText.vue'
import { getCompanionComponentBySlug } from '../content/companion/companionPackages'
import { resolveDemoComponent } from '../demos/registry'
import IconArrowLeft from '~icons/lucide/arrow-left'

const route = useRoute()
const { t } = useFintI18n()


const component = computed(() => getCompanionComponentBySlug(String(route.params.componentSlug ?? '')))

const importCode = computed(() =>
  component.value ? `import { ${component.value.name} } from '${component.value.importPath}'` : '',
)

/**
 * Таблицы API рисуются по **всем** объявленным секциям, а не по трём известным
 * ключам: пакет вправе описать и то, чего у ядра нет — например компонент,
 * живущий на чужой странице. Раньше такие секции молча не отображались.
 */
const apiSections = computed(() => component.value?.apiSections ?? [])

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
        <GrBadge tone="neutral" :title="t('showcase.header.versionLabel')">
v{{ component.version }}
</GrBadge>
        <GrBadge tone="azure">
{{ t('showcase.extraDetailPage.companionBadge') }}
</GrBadge>
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

    <section v-if="component.overview" id="about" class="scroll-mt-28 space-y-4">
      <h2 class="text-2xl font-semibold">
        {{ t(component.kind === 'composable' ? 'showcase.detailPage.about.titleComposable' : 'showcase.detailPage.about.title') }}
      </h2>

      <div class="max-w-3xl space-y-3">
        <p
          v-for="(paragraph, index) in component.overview.paragraphs"
          :key="index"
          class="showcase-text-muted text-base leading-7"
        >
          <InlineRichText :text="paragraph" />
        </p>
      </div>

      <div v-if="component.overview.features?.length" class="space-y-2">
        <h3 class="text-lg font-semibold">
          {{ t('showcase.detailPage.about.featuresTitle') }}
        </h3>
        <ul class="grid max-w-3xl gap-2">
          <li
            v-for="(feature, index) in component.overview.features"
            :key="index"
            class="showcase-text-muted flex items-start gap-2 text-sm leading-6"
          >
            <span class="i-lucide-check mt-1 h-4 w-4 shrink-0 text-[var(--gr-primary)]" aria-hidden="true" />
            <span><InlineRichText :text="feature" /></span>
          </li>
        </ul>
      </div>

      <div
        v-for="(list, listIndex) in component.overview.lists ?? []"
        :key="`list-${listIndex}`"
        class="space-y-2"
      >
        <h3 class="text-lg font-semibold">
          {{ list.title }}
        </h3>
        <ul class="grid max-w-3xl gap-2">
          <li
            v-for="(item, index) in list.items"
            :key="index"
            class="showcase-text-muted flex items-start gap-2 text-sm leading-6"
          >
            <span class="i-lucide-dot mt-1 h-4 w-4 shrink-0 text-[var(--gr-primary)]" aria-hidden="true" />
            <span><InlineRichText :text="item" /></span>
          </li>
        </ul>
      </div>
    </section>

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
          :preview-key="example.previewKey"
          :note="example.note"
        >
          <template v-if="resolveDemoComponent(example.previewKey)" #preview>
            <component :is="resolveDemoComponent(example.previewKey)" />
          </template>
        </ExampleCard>
      </div>
    </section>

    <section id="api" class="scroll-mt-28 space-y-4">
      <h2 class="text-2xl font-semibold">
        {{ t('showcase.detailPage.api.title') }}
      </h2>
      <div class="grid gap-4">
        <ApiTable
          v-for="section in apiSections"
          :key="section.key"
          :title="section.title"
          :items="section.items"
          :empty-label="t('showcase.docComponents.emptyLabel.generic')"
        />
      </div>
    </section>

    <section v-if="component.typeDeclarations" id="types" class="scroll-mt-28 space-y-4">
      <div>
        <h2 class="text-2xl font-semibold">
          {{ t('showcase.detailPage.types.title') }}
        </h2>
        <p class="showcase-text-muted mt-2 max-w-3xl text-sm leading-6">
          {{ t('showcase.detailPage.types.description') }}
        </p>
      </div>

      <CodeBlock :code="component.typeDeclarations" language="ts" expanded />
    </section>

    <RouterLink to="/extras" class="showcase-card-link inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm">
      <IconArrowLeft class="h-4 w-4" aria-hidden="true" />
      {{ t('showcase.extraDetailPage.backToExtras') }}
    </RouterLink>
  </div>

  <div v-else class="showcase-empty-state rounded-3xl border border-dashed px-5 py-10 text-sm leading-6">
    {{ t('showcase.extraDetailPage.notFound') }}
    <RouterLink to="/extras" class="underline">
{{ t('showcase.extraDetailPage.notFoundLink') }}
</RouterLink>
  </div>
</template>
