<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import { GrCard, GrSelect } from '@feugene/granularity'

import ShowcasePageHero from '../components/showcase/ShowcasePageHero.vue'
import { useShowcasePageI18n } from '../app/useShowcasePageI18n'
import {
  type ComponentGraphNode,
  baseComponents,
  buildComponentGraph,
  focusSubgraph,
  layoutFocusSubgraph,
  mostDependedOn,
} from '../app/componentDependencyGraph'

const route = useRoute()
const router = useRouter()
const { t } = useFintI18n()
const { localizePageByName } = useShowcasePageI18n()

const page = computed(() => localizePageByName('architecture'))
const sections = computed(() => Object.fromEntries(
  page.value.sections.map(section => [section.id, section]),
))

const graph = buildComponentGraph()
const base = baseComponents(graph)
const loadBearing = mostDependedOn(graph)
const maxDependents = Math.max(1, ...loadBearing.map(node => node.dependents.length))

const levels = graph.levels.map((names, level) => ({
  level,
  names,
  nodes: names.map(name => graph.byName.get(name)!),
}))

const focusOptions = graph.nodes.map(node => ({ value: node.name, label: node.name }))
// Стартует на самом дорогом компоненте: он же самый глубокий, поэтому первый
// показ сразу отвечает и «что тянет за собой», и «как выглядит глубина 3».
const defaultFocus = [...graph.nodes]
  .sort((left, right) => right.transitiveCount - left.transitiveCount)[0]?.name ?? ''

// Карточка компонента ссылается сюда с `?focus=GrX`, поэтому выбор живёт в
// адресе: иначе ссылка «открыть граф» приводила бы на чужой компонент.
const focus = ref(resolveFocus(route.query.focus))
watch(() => route.query.focus, value => focus.value = resolveFocus(value))
watch(focus, (value) => {
  if (resolveFocus(route.query.focus) !== value)
    router.replace({ query: { ...route.query, focus: value } })
})

function resolveFocus(value: unknown): string {
  const name = Array.isArray(value) ? value[0] : value

  return typeof name === 'string' && graph.byName.has(name) ? name : defaultFocus
}

const focusNode = computed(() => graph.byName.get(focus.value))
const layout = computed(() => layoutFocusSubgraph(focusSubgraph(graph, focus.value)))

/**
 * Ребро рисуется кривой Безье с горизонтальными усами: прямая между узлами
 * соседних колонок сливается с их рамками, а вертикальный сдвиг делает пучок
 * рёбер к опорному узлу неразличимым.
 */
function edgePath(edge: { from: { x: number, y: number, width: number, height: number }, to: { x: number, y: number, height: number } }): string {
  const startX = edge.from.x + edge.from.width
  const startY = edge.from.y + edge.from.height / 2
  const endY = edge.to.y + edge.to.height / 2
  const control = (edge.to.x - startX) / 2

  return `M ${startX} ${startY} C ${startX + control} ${startY} ${edge.to.x - control} ${endY} ${edge.to.x} ${endY}`
}

function columnLabel(column: number): string {
  if (column < 0)
    return t('showcase.architecturePage.focus.columnDependents')

  return column === 0
    ? t('showcase.architecturePage.focus.columnFocus')
    : t('showcase.architecturePage.focus.columnDepth', { depth: column })
}

function nodeTitle(node: ComponentGraphNode): string {
  return t('showcase.architecturePage.nodeTitle', {
    name: node.name,
    dependencies: node.dependencies.length,
    dependents: node.dependents.length,
  })
}
</script>

<template>
  <div class="space-y-8">
    <ShowcasePageHero
      :eyebrow="page.eyebrow"
      :title="page.title"
      :description="page.description"
    />

    <section id="base" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          {{ sections.base.title }} · {{ base.length }}
        </h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          {{ sections.base.description }}
        </p>
      </div>

      <GrCard class="showcase-panel rounded-3xl border p-5">
        <ul class="flex flex-wrap gap-2">
          <li v-for="node in base" :key="node.name">
            <RouterLink
              v-if="node.path"
              :to="node.path"
              class="showcase-pill showcase-interactive-accent inline-flex items-center border px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {{ node.name }}
            </RouterLink>
            <span
              v-else
              class="showcase-pill inline-flex items-center border px-3 py-1.5 text-sm font-medium"
            >
              {{ node.name }}
            </span>
          </li>
        </ul>
      </GrCard>
    </section>

    <section id="load-bearing" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          {{ sections['load-bearing'].title }}
        </h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          {{ sections['load-bearing'].description }}
        </p>
      </div>

      <GrCard class="showcase-panel rounded-3xl border p-5">
        <ul class="grid gap-2">
          <li
            v-for="node in loadBearing"
            :key="node.name"
            class="grid grid-cols-[10rem_1fr_2.5rem] items-center gap-3"
          >
            <RouterLink
              v-if="node.path"
              :to="node.path"
              class="showcase-interactive-accent truncate text-sm font-medium transition-colors"
            >
              {{ node.name }}
            </RouterLink>
            <span v-else class="showcase-text-muted truncate text-sm font-medium">
              {{ node.name }}
            </span>

            <span class="showcase-inline-surface h-2 rounded-full border">
              <span
                class="block h-full rounded-full bg-[var(--gr-primary)]"
                :style="{ width: `${(node.dependents.length / maxDependents) * 100}%` }"
              />
            </span>

            <span class="showcase-text-subtle text-right text-sm [font-variant-numeric:tabular-nums]">
              {{ node.dependents.length }}
            </span>
          </li>
        </ul>
      </GrCard>
    </section>

    <section id="levels" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          {{ sections.levels.title }}
        </h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          {{ sections.levels.description }}
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GrCard
          v-for="entry in levels"
          :key="entry.level"
          class="showcase-panel-soft rounded-3xl border p-5"
        >
          <div class="flex items-baseline justify-between gap-3">
            <h3 class="showcase-text-subtle text-sm font-semibold uppercase tracking-[0.16em]">
              {{ t('showcase.architecturePage.levels.label', { level: entry.level }) }}
            </h3>
            <span class="text-2xl font-semibold [font-variant-numeric:tabular-nums]">
              {{ entry.names.length }}
            </span>
          </div>
          <p class="showcase-text-muted mt-2 text-xs leading-5">
            {{ t(`showcase.architecturePage.levels.hint.${entry.level === 0 ? 'base' : 'derived'}`) }}
          </p>
          <p class="showcase-text-subtle mt-3 text-xs leading-5">
            {{ entry.names.join(' · ') }}
          </p>
        </GrCard>
      </div>
    </section>

    <section id="focus" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          {{ sections.focus.title }}
        </h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          {{ sections.focus.description }}
        </p>
      </div>

      <GrCard class="showcase-panel rounded-3xl border p-5 space-y-5">
        <div class="flex flex-wrap items-center gap-4">
          <div class="min-w-64">
            <GrSelect
              v-model="focus"
              :options="focusOptions"
              :aria-label="t('showcase.architecturePage.focus.selectLabel')"
            />
          </div>
          <p v-if="focusNode" class="showcase-text-muted text-sm leading-6">
            {{ t('showcase.architecturePage.focus.summary', {
              level: focusNode.level,
              transitive: focusNode.transitiveCount,
              dependents: focusNode.dependents.length,
            }) }}
          </p>
        </div>

        <!-- Диаграмма — иллюстрация: тот же подграф ниже лежит списком, иначе
             содержимое было бы доступно только зрячему пользователю. -->
        <div
          class="overflow-x-auto"
          tabindex="0"
          :aria-label="t('showcase.architecturePage.focus.scrollLabel')"
        >
          <svg
            v-if="layout.nodes.length"
            :viewBox="`-1 -1 ${layout.width + 2} ${layout.height + 2}`"
            :width="layout.width"
            :height="layout.height"
            role="img"
            :aria-label="t('showcase.architecturePage.focus.diagramLabel', { name: focus })"
          >
            <path
              v-for="(edge, index) in layout.edges"
              :key="`edge-${index}`"
              :d="edgePath(edge)"
              :style="{ fill: 'none', stroke: 'var(--gr-brd)', strokeWidth: '1.5px' }"
            />
            <g
              v-for="node in layout.nodes"
              :key="node.name"
              :transform="`translate(${node.x}, ${node.y})`"
            >
              <rect
                :width="node.width"
                :height="node.height"
                rx="8"
                :style="{
                  fill: node.name === focus ? 'var(--gr-primary)' : 'var(--gr-card)',
                  stroke: 'var(--gr-brd)',
                }"
              />
              <!-- Размеры и цвета — инлайновым `style`, а не презентационными
                   атрибутами: `presetAttributify` превращает `font-size="13"`
                   в утилиту и подставляет 3.25rem. -->
              <text
                :x="node.width / 2"
                :y="node.height / 2"
                text-anchor="middle"
                dominant-baseline="central"
                :style="{
                  fontSize: '13px',
                  fill: node.name === focus ? 'var(--gr-primary-fg)' : 'var(--gr-fg)',
                }"
              >
                {{ node.name }}
              </text>
            </g>
          </svg>
        </div>

        <ul class="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <li
            v-for="node in layout.nodes"
            :key="`text-${node.name}`"
            class="showcase-inline-surface border px-3 py-2 text-sm leading-6"
          >
            <span class="showcase-text-subtle text-xs">
              {{ columnLabel(node.column) }}
            </span>
            <RouterLink
              v-if="graph.byName.get(node.name)?.path"
              :to="graph.byName.get(node.name)!.path!"
              class="showcase-interactive-accent block font-medium transition-colors"
            >
              {{ nodeTitle(graph.byName.get(node.name)!) }}
            </RouterLink>
            <span v-else class="showcase-text-muted block font-medium">
              {{ nodeTitle(graph.byName.get(node.name)!) }}
            </span>
          </li>
        </ul>
      </GrCard>
    </section>

    <section id="soft-links" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          {{ sections['soft-links'].title }}
        </h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          {{ sections['soft-links'].description }}
        </p>
      </div>

      <GrCard class="showcase-panel-soft rounded-3xl border p-5">
        <ul class="grid gap-2 max-w-3xl">
          <li
            v-for="(bullet, index) in sections['soft-links'].bullets"
            :key="index"
            class="showcase-text-muted text-sm leading-6"
          >
            {{ bullet }}
          </li>
        </ul>
      </GrCard>
    </section>
  </div>
</template>
