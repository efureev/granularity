<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import themeManifest from 'virtual:granum/themes'

import { comparisonTable, designDoc } from '../docs'
import DocSection from '../parts/DocSection.vue'
import ThemeComparison from '../parts/ThemeComparison.vue'
import { builtThemes } from '../themes'
import ButtonSample from './ButtonSample.vue'
import { buttonSamples } from './samples'

const route = useRoute()
const current = computed(() => String(route.params.theme))
const themes = builtThemes(themeManifest)

const doc = designDoc('button')
const comparison = doc ? comparisonTable(doc) : undefined
</script>

<template>
  <div class="flex flex-col gap-12">
    <DocSection title="Один шаблон — каждая тема" lead="Строка — тот же шаблон в каждой теме каталога, в режиме страницы. Наведите и нажмите: кнопки настоящие.">
      <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Кнопка в темах каталога">
        <table class="w-full min-w-[1040px] table-fixed border-collapse">
          <thead>
            <tr>
              <th scope="col" class="w-[152px] px-4 py-3 text-start">
                <span class="sr-only">Образец</span>
              </th>
              <th
                v-for="theme in themes"
                :key="theme.entry.id"
                scope="col"
                class="border-s border-[var(--gr-brd)] px-4 py-3 text-start text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]"
                :class="theme.entry.id === current ? 'bg-[var(--gr-accent)] text-[var(--gr-accent-fg)]' : ''"
              >
                <RouterLink class="themes-link" :to="{ params: { theme: theme.entry.id }, query: route.query }">
                  {{ theme.entry.title }}
                </RouterLink>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sample in buttonSamples" :key="sample.id" class="border-t border-[var(--gr-brd)]">
              <th scope="row" class="px-4 py-3 text-start align-middle text-[length:var(--gr-text-xs)] font-500 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                {{ sample.title }}
              </th>
              <td v-for="theme in themes" :key="theme.entry.id" class="h-px border-s border-[var(--gr-brd)] p-0">
                <GrConfigProvider :theme="theme.entry.id" class="h-full">
                  <div class="flex h-full items-center bg-[var(--gr-bg)] px-4 py-4 text-[var(--gr-fg)]">
                    <ButtonSample :sample="sample.id" />
                  </div>
                </GrConfigProvider>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>

    <DocSection v-if="comparison" title="Чем темы различаются" lead="Сводка документа дизайна кнопки. Столбец выбранной темы подсвечен, название ведёт на её страницу.">
      <ThemeComparison :table="comparison" :current="current" />
    </DocSection>
  </div>
</template>

<style scoped>
.themes-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
  text-underline-offset: 3px;
}

.themes-link:hover {
  text-decoration-color: currentColor;
}

.themes-link:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
  border-radius: var(--gr-radius-xs);
}
</style>
