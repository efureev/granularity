<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import IconArrowUpRight from '~icons/lucide/arrow-up-right'

import { catalog } from '../catalog'
import DocSection from '../parts/DocSection.vue'
import { plural } from '../plural'
import { themeComponentDefaults, themeComponentSections } from '../themeTokens'
import type { ThemeView } from '../tokens'

/**
 * Каким компонентам тема даёт значения и пропсы. Сами значения — на странице
 * компонента: ссылка ведёт туда под этой темой.
 */
const props = defineProps<{ view: ThemeView }>()

const literal = (value: unknown): string => (typeof value === 'string' ? `'${value}'` : String(value))

const rows = computed(() => {
  const defaults = themeComponentDefaults(props.view.data)
  const sections = themeComponentSections(props.view.data)
  const names = [...new Set([...sections.map(item => item.component), ...defaults.map(item => item.component)])]
  return names.map((component) => {
    const section = sections.find(item => item.component === component)
    return {
      component,
      packageId: section?.packageId,
      values: section?.values ?? 0,
      props: defaults.filter(item => item.component === component).map(item => `${item.prop}: ${literal(item.value)}`),
      page: catalog.find(item => item.exports.includes(component)),
    }
  })
})
</script>

<template>
  <DocSection title="Значения компонентов" wide-lead lead="Разделы темы для токенов компонентов и пропсы, которые она включает по умолчанию. Сами значения — на странице компонента.">
    <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Значения компонентов в теме">
      <table class="w-full min-w-[760px] border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
        <thead>
          <tr class="text-[var(--gr-muted-fg)]">
            <th scope="col" class="px-4 py-2.5 text-start font-500">
              компонент
            </th>
            <th scope="col" class="px-4 py-2.5 text-start font-500">
              значений
            </th>
            <th scope="col" class="px-4 py-2.5 text-start font-500">
              пропсы от темы
            </th>
            <th scope="col" class="px-4 py-2.5 text-end font-500">
              <span class="sr-only">Страница</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.component" class="border-t border-[var(--gr-brd)]">
            <th scope="row" class="px-4 py-3 text-start align-top font-400">
              <code class="block font-[var(--gr-font-mono)] text-[var(--gr-fg)]">{{ row.component }}</code>
              <span v-if="row.packageId" class="text-[var(--gr-muted-fg)]">{{ row.packageId }}</span>
            </th>
            <td class="px-4 py-3 align-top [font-variant-numeric:tabular-nums]">
              {{ row.values > 0 ? plural(row.values, ['значение', 'значения', 'значений']) : '—' }}
            </td>
            <td class="px-4 py-3 align-top">
              <code v-for="prop in row.props" :key="prop" class="block font-[var(--gr-font-mono)]">{{ prop }}</code>
              <span v-if="row.props.length === 0" class="text-[var(--gr-muted-fg)]">—</span>
            </td>
            <td class="px-4 py-3 text-end align-top">
              <RouterLink
                v-if="row.page"
                class="value-link"
                :to="{ name: 'component', params: { theme: view.id, component: row.page.id }, query: { tab: 'tokens' } }"
              >
                Значения в теме
                <IconArrowUpRight aria-hidden="true" />
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DocSection>
</template>

<style scoped>
.value-link {
  display: inline-flex;
  align-items: center;
  gap: var(--gr-space-1);
  color: var(--gr-primary-text);
  font-weight: 500;
  white-space: nowrap;
}

.value-link:hover {
  text-decoration: underline;
}

.value-link:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
  border-radius: var(--gr-radius-xs);
}
</style>
