<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useFintI18n } from '@feugene/fint-i18n/vue'

import { buildComponentGraph } from '../../app/componentDependencyGraph'

const props = defineProps<{ componentName: string }>()

const { t } = useFintI18n()

const graph = buildComponentGraph()

const node = computed(() => graph.byName.get(props.componentName))

const chips = computed(() => {
  const current = node.value
  if (!current)
    return []

  const toChip = (name: string) => ({ name, path: graph.byName.get(name)?.path })

  return [
    {
      key: 'dependsOn',
      title: t('showcase.detailPage.dependencies.dependsOn'),
      empty: t('showcase.detailPage.dependencies.dependsOnEmpty'),
      items: current.dependencies.map(toChip),
    },
    {
      key: 'usedBy',
      title: t('showcase.detailPage.dependencies.usedBy'),
      empty: t('showcase.detailPage.dependencies.usedByEmpty'),
      items: current.dependents.map(toChip),
    },
  ]
})
</script>

<template>
  <article class="showcase-panel-soft rounded-3xl border p-5">
    <h3 class="showcase-text-subtle text-sm font-semibold uppercase tracking-[0.16em]">
      {{ t('showcase.detailPage.info.dependenciesTitle') }}
    </h3>

    <template v-if="node">
      <div v-for="group in chips" :key="group.key" class="mt-4">
        <h4 class="showcase-text-subtle text-xs font-semibold">
          {{ group.title }}
        </h4>

        <ul v-if="group.items.length" class="mt-2 flex flex-wrap gap-2">
          <li v-for="item in group.items" :key="item.name">
            <RouterLink
              v-if="item.path"
              :to="item.path"
              class="showcase-pill showcase-interactive-accent inline-flex items-center border px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {{ item.name }}
            </RouterLink>
            <span
              v-else
              class="showcase-pill inline-flex items-center border px-3 py-1.5 text-sm font-medium"
            >
              {{ item.name }}
            </span>
          </li>
        </ul>

        <p v-else class="showcase-text-muted mt-2 text-sm leading-6">
          {{ group.empty }}
        </p>
      </div>

      <!-- Цена гранулярной селекции: пресет разворачивает граф `dependencies`
           целиком, поэтому `components: ['GrX']` тянет CSS и safelist всех
           перечисленных ниже соседей, а не только прямых. -->
      <RouterLink
        :to="{ path: '/architecture', query: { focus: componentName } }"
        class="showcase-inline-surface showcase-interactive-accent mt-4 flex items-center justify-between gap-3 border px-4 py-2 text-sm font-medium transition-colors"
      >
        <span>{{ t('showcase.detailPage.dependencies.transitive', { count: node.transitiveCount }) }}</span>
        <span class="showcase-text-subtle text-xs">
          {{ t('showcase.detailPage.dependencies.openGraph') }}
        </span>
      </RouterLink>
    </template>
  </article>
</template>
