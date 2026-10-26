<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { grThemeCatalog } from '@feugene/granularity-tokens'
import IconArrowUpRight from '~icons/lucide/arrow-up-right'

import { componentDefaultsOf } from '../componentTokens'
import { designDoc, themeDocSection } from '../docs'
import DocSection from '../parts/DocSection.vue'
import MarkdownBlock from '../parts/MarkdownBlock.vue'
import ThemeIslands from '../parts/ThemeIslands.vue'
import { themeLineage } from '../themes'
import { useViewedTheme } from '../viewedTheme'
import ButtonSample from './ButtonSample.vue'
import { buttonSamples } from './samples'

const OWNERS = ['GrButton', 'GrButtonGroup']

const theme = useViewedTheme()
const entry = computed(() => grThemeCatalog.find(item => item.id === theme.value.id)!)
const doc = designDoc('GrButton')
const section = computed(() => (doc ? themeDocSection(doc, theme.value.id) : undefined))

const literal = (value: unknown): string => (typeof value === 'string' ? `'${value}'` : String(value))

/** Пропы, которые тема включает кнопке и группе: то, что токеном не выразить. */
const defaults = computed(() => OWNERS.flatMap(owner => Object.entries(componentDefaultsOf(theme.value.data, owner))
  .map(([prop, value]) => ({ owner, prop, value: literal(value) }))))
</script>

<template>
  <div class="flex flex-col gap-12">
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)] tracking-[-0.01em]">
            «{{ entry.title }}»
          </h2>
          <GrButton :as="RouterLink" :to="{ name: 'theme', params: { slug: entry.id } }" variant="ghost" tone="neutral" size="sm">
            Страница темы
            <template #suffix>
              <GrIcon><IconArrowUpRight /></GrIcon>
            </template>
          </GrButton>
        </div>
        <p v-if="entry.description" class="max-w-[72ch] text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
          {{ entry.description }}
        </p>
        <div class="flex flex-wrap gap-2">
          <GrBadge tone="neutral" size="sm">
            {{ themeLineage(entry) }}
          </GrBadge>
          <GrBadge v-if="entry.version" tone="neutral" size="sm">
            версия {{ entry.version }}
          </GrBadge>
          <GrBadge tone="neutral" size="sm">
            <code class="font-[var(--gr-font-mono)]">{ theme: '{{ entry.id }}' }</code>
          </GrBadge>
        </div>
      </div>

      <aside class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5" aria-labelledby="theme-defaults-title">
        <h3 id="theme-defaults-title" class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
          Пропсы от темы
        </h3>
        <ul v-if="defaults.length > 0" class="flex flex-col gap-2">
          <li v-for="item in defaults" :key="`${item.owner}.${item.prop}`" class="flex flex-wrap items-baseline gap-x-2 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
            <span class="text-[var(--gr-muted-fg)]">{{ item.owner }}</span>
            <code class="font-[var(--gr-font-mono)]">{{ item.prop }}: {{ item.value }}</code>
          </li>
        </ul>
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ defaults.length > 0
            ? 'То, что токеном не выразить, тема включает пропсами по умолчанию (componentDefaults). Проп на самой кнопке их перебивает.'
            : 'Тема не меняет пропсы: кнопка ведёт себя по умолчанию, вид задают только токены.' }}
        </p>
      </aside>
    </div>

    <DocSection title="В каждом режиме" lead="Режим — пара в атрибуте поддерева: острова светлого и тёмного стоят рядом на одной странице.">
      <ThemeIslands>
        <div class="flex flex-col gap-3">
          <ButtonSample v-for="sample in buttonSamples" :key="sample.id" :sample="sample.id" />
        </div>
      </ThemeIslands>
    </DocSection>

    <DocSection v-if="section" title="Решения темы" lead="Из документа дизайна кнопки: что тема меняет и через какие токены.">
      <MarkdownBlock :source="section" />
    </DocSection>
  </div>
</template>
