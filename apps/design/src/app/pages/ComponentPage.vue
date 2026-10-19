<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { conceptVersions, findComponent, implementedVersion, type DesignVersion } from '../catalog'
import { comparisonTable, designDoc } from '../docs'
import BoardViewer from '../parts/BoardViewer.vue'
import DocSection from '../parts/DocSection.vue'
import MarkdownBlock from '../parts/MarkdownBlock.vue'
import PageHeader from '../parts/PageHeader.vue'
import VersionComparison from '../parts/VersionComparison.vue'
import { implementedSpecs } from '../specs'
import NotFoundPage from './NotFoundPage.vue'

type Family = 'implemented' | 'concept'

const route = useRoute()
const router = useRouter()

const component = computed(() => findComponent(String(route.params.component)))

const version = computed<DesignVersion | undefined>(() => {
  const item = component.value
  if (!item)
    return undefined
  const id = route.params.version
  return id ? item.versions.find(entry => entry.id === id) : implementedVersion(item)
})

const concepts = computed(() => (component.value ? conceptVersions(component.value) : []))
const family = computed<Family>(() => (version.value?.status === 'concept' ? 'concept' : 'implemented'))

const familyOptions = computed(() => [
  { value: 'implemented', label: 'Реализованная' },
  { value: 'concept', label: `Экспериментальные · ${concepts.value.length}` },
])

/** Вернувшись к экспериментам, попадаешь на тот концепт, с которого ушёл. */
const lastConcept = ref<string>()
watch(version, (current) => {
  if (current?.status === 'concept')
    lastConcept.value = current.id
}, { immediate: true })

function versionLink(versionId: string | undefined) {
  return {
    name: 'component',
    params: { component: component.value?.id, version: versionId },
    // Вкладка макета переезжает вместе с версией: «Варианты» одной версии
    // сравниваются с «Вариантами» другой в один клик.
    query: route.query,
  }
}

function selectFamily(next: string | number): void {
  if (next === family.value)
    return
  if (next === 'implemented')
    void router.push(versionLink(undefined))
  else
    void router.push(versionLink(lastConcept.value ?? concepts.value[0]?.id))
}

const tabs = computed(() => [
  { value: 'spec', label: 'Спецификация' },
  ...(version.value?.boards ?? []).map(board => ({ value: board.id, label: board.title })),
])

const activeTab = computed({
  get: () => {
    const board = route.query.board
    return typeof board === 'string' && tabs.value.some(tab => tab.value === board) ? board : 'spec'
  },
  set: (next: string) => {
    void router.replace({ query: next === 'spec' ? {} : { board: next } })
  },
})

const doc = computed(() => (component.value ? designDoc(component.value.id) : undefined))
const versionSection = computed(() => (version.value ? doc.value?.sections.get(version.value.docHeading) : undefined))
const comparison = computed(() => (doc.value ? comparisonTable(doc.value) : undefined))
const spec = computed(() => (component.value ? implementedSpecs[component.value.id] : undefined))
</script>

<template>
  <NotFoundPage v-if="!component || !version" />

  <div v-else class="mx-auto flex max-w-[1360px] flex-col gap-8 px-4 py-10 lg:px-10">
    <PageHeader eyebrow="Компонент" :title="component.name" :lead="component.summary">
      <div class="flex flex-wrap gap-2">
        <code
          v-for="name in component.exports"
          :key="name"
          class="rounded-[var(--gr-radius-sm)] bg-[var(--gr-muted)] px-2 py-0.5 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]"
        >{{ name }}</code>
        <code class="rounded-[var(--gr-radius-sm)] px-2 py-0.5 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ component.importPath }}</code>
      </div>
    </PageHeader>

    <section class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 shadow-[var(--gr-shadow-1)] lg:p-5" aria-label="Версия дизайна">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <GrSegmented
          aria-label="Версия дизайна"
          :model-value="family"
          :options="familyOptions"
          @update:model-value="selectFamily"
        />
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ family === 'implemented'
            ? 'То, что ставится из пакета: живая спецификация на настоящих компонентах и макеты версии.'
            : 'Концепты на том же API — пропы, слоты, веса и тоны прежние. В пакете не реализованы.' }}
        </p>
      </div>

      <nav v-if="family === 'concept'" aria-label="Экспериментальные версии">
        <ul class="grid gap-3 md:grid-cols-3">
          <li v-for="concept in concepts" :key="concept.id">
            <RouterLink
              :to="versionLink(concept.id)"
              class="concept-card"
              :aria-current="concept.id === version.id ? 'page' : undefined"
            >
              <span class="flex items-center gap-1.5" aria-hidden="true">
                <span
                  v-for="(color, index) in concept.palette"
                  :key="index"
                  class="h-3 w-3 rounded-full border border-[color-mix(in_srgb,var(--gr-fg)_18%,transparent)]"
                  :style="{ background: color }"
                />
              </span>
              <span class="flex items-center gap-2">
                <span class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">{{ concept.title }}</span>
                <GrBadge tone="warning" size="xs">концепт</GrBadge>
              </span>
              <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">{{ concept.tagline }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div v-else class="flex flex-wrap items-center gap-2">
        <span class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">{{ version.title }}</span>
        <GrBadge tone="success" size="xs">
в пакете
</GrBadge>
        <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">{{ version.tagline }}</span>
      </div>
    </section>

    <div :key="version.id" class="flex flex-col gap-6">
      <GrTabs v-model="activeTab" variant="line" :tabs="tabs" :id-base="`tabs-${version.id}`" />

      <GrTabPanels v-model="activeTab" :id-base="`tabs-${version.id}`">
        <GrTabPanel value="spec" keep-alive lazy>
          <div class="flex flex-col gap-12">
            <component :is="spec" v-if="version.status === 'implemented' && spec" />

            <GrAlert v-if="version.status === 'concept'" tone="info">
              Концепт «{{ version.title }}» — направление для темы или будущей версии. Ниже — его правила
              и что потребуется, чтобы перенести его в пакет; на вкладках — макеты.
            </GrAlert>

            <DocSection
              v-if="versionSection"
              :title="version.status === 'implemented' ? 'Решения версии' : version.title"
              :lead="version.status === 'implemented' ? 'Что изменилось по сравнению с прежней кнопкой и через какие токены это задаётся.' : undefined"
            >
              <MarkdownBlock :source="versionSection" />
            </DocSection>

            <DocSection
              v-if="comparison"
              title="Четыре версии рядом"
              lead="Пропы, слоты, пять весов, восемь тонов и шкала высот у всех общие; отличаются вид, движение и то, как кнопка показывает состояние."
            >
              <VersionComparison :table="comparison" :current="version.title" />
            </DocSection>
          </div>
        </GrTabPanel>

        <GrTabPanel v-for="board in version.boards" :key="board.id" :value="board.id" keep-alive lazy>
          <BoardViewer :component-id="component.id" :version-id="version.id" :board="board" />
        </GrTabPanel>
      </GrTabPanels>
    </div>
  </div>
</template>

<style scoped>
.concept-card {
  display: flex;
  flex-direction: column;
  gap: var(--gr-space-2);
  height: 100%;
  padding: var(--gr-space-4);
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-md);
  background: var(--gr-bg);
  color: var(--gr-fg);
  transition:
    border-color var(--gr-duration-fast) var(--gr-ease-out),
    background-color var(--gr-duration-fast) var(--gr-ease-out);
}

.concept-card:hover {
  border-color: var(--gr-control-brd);
}

.concept-card:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}

.concept-card[aria-current='page'] {
  border-color: var(--gr-primary);
  background: var(--gr-accent);
  box-shadow: inset 0 0 0 1px var(--gr-primary);
}
</style>
