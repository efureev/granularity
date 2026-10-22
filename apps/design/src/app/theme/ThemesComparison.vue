<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import TokenValue from '../parts/TokenValue.vue'
import { plural } from '../plural'
import { THEME_BUILD_LABEL, type DesignTheme, themeLineage } from '../themes'
import { themeComponentDefaults, themeComponentSections } from '../themeTokens'
import type { ThemeView } from '../tokens'

/**
 * Темы каталога рядом: паспорт и то, чем они различаются на деле, — шрифт,
 * угол контролов, главный цвет по режимам, значения и пропсы компонентов.
 * Значения — из данных тем, образцы цвета — браузером под парой режима.
 */
const props = defineProps<{
  themes: readonly DesignTheme[]
  views: ReadonlyMap<string, ThemeView>
  current: string
}>()

const literal = (value: unknown): string => (typeof value === 'string' ? `'${value}'` : String(value))
const firstFamily = (stack: string | undefined): string | undefined => stack?.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '')

const columns = computed(() => props.themes.map((theme) => {
  const view = props.views.get(theme.entry.id)
  const sections = view ? themeComponentSections(view.data) : []
  return {
    theme,
    view,
    font: firstFamily(view?.data.root['gr-font-ui']),
    radius: view?.data.root['gr-radius-control'],
    primary: theme.modes.map(mode => ({ pair: mode.value, title: mode.title ?? mode.name, value: view?.modes.get(mode.name)?.['gr-primary'] })),
    values: sections.reduce((sum, item) => sum + item.values, 0),
    components: sections.length,
    props: view ? themeComponentDefaults(view.data).map(item => `${item.component}.${item.prop}: ${literal(item.value)}`) : [],
  }
}))
</script>

<template>
  <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Темы каталога рядом">
    <table class="w-full min-w-[960px] table-fixed border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
      <colgroup>
        <col class="w-[168px]">
        <col v-for="column in columns" :key="column.theme.entry.id">
      </colgroup>
      <thead>
        <tr>
          <th scope="col" class="px-4 py-3 text-start">
            <span class="sr-only">Свойство</span>
          </th>
          <th
            v-for="column in columns"
            :key="column.theme.entry.id"
            scope="col"
            class="border-s border-[var(--gr-brd)] px-4 py-3 text-start text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]"
            :class="column.theme.entry.id === current ? 'bg-[var(--gr-accent)] text-[var(--gr-accent-fg)]' : ''"
          >
            <RouterLink class="comparison-link" :to="{ name: 'theme', params: { slug: column.theme.entry.id } }">
              {{ column.theme.entry.title }}
            </RouterLink>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-t border-[var(--gr-brd)]">
          <th scope="row" class="px-4 py-3 text-start align-top font-500 text-[var(--gr-muted-fg)]">
            Сборка
          </th>
          <td v-for="column in columns" :key="column.theme.entry.id" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
            {{ THEME_BUILD_LABEL[column.theme.build] }}
          </td>
        </tr>
        <tr class="border-t border-[var(--gr-brd)]">
          <th scope="row" class="px-4 py-3 text-start align-top font-500 text-[var(--gr-muted-fg)]">
            Происхождение
          </th>
          <td v-for="column in columns" :key="column.theme.entry.id" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
            {{ themeLineage(column.theme.entry) }}
          </td>
        </tr>
        <tr class="border-t border-[var(--gr-brd)]">
          <th scope="row" class="px-4 py-3 text-start align-top font-500 text-[var(--gr-muted-fg)]">
            Шрифт интерфейса
          </th>
          <td v-for="column in columns" :key="column.theme.entry.id" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
            <span v-if="column.font" class="text-[length:var(--gr-text-sm)]" :style="{ fontFamily: column.view?.data.root['gr-font-ui'] }">{{ column.font }}</span>
            <GrSkeleton v-else :rows="1" />
          </td>
        </tr>
        <tr class="border-t border-[var(--gr-brd)]">
          <th scope="row" class="px-4 py-3 text-start align-top font-500 text-[var(--gr-muted-fg)]">
            Угол контролов
          </th>
          <td v-for="column in columns" :key="column.theme.entry.id" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
            <code v-if="column.radius" class="font-[var(--gr-font-mono)]">{{ column.radius }}</code>
            <GrSkeleton v-else :rows="1" />
          </td>
        </tr>
        <tr class="border-t border-[var(--gr-brd)]">
          <th scope="row" class="px-4 py-3 text-start align-top font-500 text-[var(--gr-muted-fg)]">
            Главный цвет
          </th>
          <td v-for="column in columns" :key="column.theme.entry.id" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
            <span class="flex flex-col gap-1.5">
              <span v-for="mode in column.primary" :key="mode.pair" class="flex items-center gap-2">
                <TokenValue v-if="mode.value" name="--gr-primary" :value="mode.value" :preview="column.theme.build === 'absent' ? undefined : 'color'" :modes="[mode]" />
                <span class="text-[var(--gr-muted-fg)]">{{ mode.title }}</span>
              </span>
            </span>
          </td>
        </tr>
        <tr class="border-t border-[var(--gr-brd)]">
          <th scope="row" class="px-4 py-3 text-start align-top font-500 text-[var(--gr-muted-fg)]">
            Значения компонентов
          </th>
          <td v-for="column in columns" :key="column.theme.entry.id" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
            <template v-if="column.view">
              {{ plural(column.values, ['значение', 'значения', 'значений']) }} ·
              {{ plural(column.components, ['компонент', 'компонента', 'компонентов']) }}
            </template>
            <GrSkeleton v-else :rows="1" />
          </td>
        </tr>
        <tr class="border-t border-[var(--gr-brd)]">
          <th scope="row" class="px-4 py-3 text-start align-top font-500 text-[var(--gr-muted-fg)]">
            Пропсы от темы
          </th>
          <td v-for="column in columns" :key="column.theme.entry.id" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
            <code v-for="prop in column.props" :key="prop" class="block break-words font-[var(--gr-font-mono)]">{{ prop }}</code>
            <span v-if="column.view && column.props.length === 0" class="text-[var(--gr-muted-fg)]">поведение по умолчанию</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.comparison-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
  text-underline-offset: 3px;
}

.comparison-link:hover {
  text-decoration-color: currentColor;
}

.comparison-link:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
  border-radius: var(--gr-radius-xs);
}
</style>
