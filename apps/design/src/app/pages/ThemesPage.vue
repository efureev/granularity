<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useTheme } from '@feugene/granularity'
import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '@feugene/granularity-tokens'
import themeManifest from 'virtual:granum/themes'

import CodeBlock from '../parts/CodeBlock.vue'
import DocSection from '../parts/DocSection.vue'
import PageHeader from '../parts/PageHeader.vue'
import { plural } from '../plural'
import ThemeCatalogCard from '../theme/ThemeCatalogCard.vue'
import ThemesComparison from '../theme/ThemesComparison.vue'
import { THEME_STORAGE_KEY } from '../theme'
import { orderedThemes } from '../themes'
import { useThemeViews } from '../viewedTheme'

const route = useRoute()
const { mode: documentMode } = useTheme({ storageKey: THEME_STORAGE_KEY })

const themes = orderedThemes(themeManifest)
const { views, error } = useThemeViews(themes.map(theme => theme.entry.id))
const current = computed(() => String(route.params.theme))

/** Режим образцов — свой: каталог сравнивают в одном режиме, не трогая страницу. Смена режима в шапке его догоняет. */
const specimenMode = ref(documentMode.value)
watch(documentMode, (next) => {
  specimenMode.value = next
})
const modeOptions = [...new Map(themes.flatMap(theme => theme.entry.modes).map(mode => [mode.name, { value: mode.name, label: mode.title ?? mode.name }])).values()]

const stats = [
  { value: themes.length, label: plural(themes.length, ['тема', 'темы', 'тем']).replace(/^\d+ /, '') },
  { value: grRoleTokens.length, label: 'ролей' },
  { value: grFoundationTokens.length, label: 'примитивов' },
  { value: grDerivedTokens.length, label: 'производных' },
]

const defaultTheme = themes.find(theme => theme.build === 'default')!.entry.id
const configSnippet = computed(() => [
  '// granum.config.ts',
  'themes: [',
  ...themes.filter(theme => theme.build !== 'absent').map((theme) => {
    const modes = theme.entry.modes.map(mode => `'${mode.name}'`).join(', ')
    return theme.entry.id === defaultTheme
      ? `  { theme: '${theme.entry.id}', default: true, modes: [${modes}] },`
      : `  { theme: '${theme.entry.id}', modes: [${modes}] },`
  }),
  '],',
].join('\n'))

const runtimeSnippet = `import { useTheme } from '@feugene/granularity'

const { setTheme, toggleMode } = useTheme()

// Лист дополнительной темы грузится по адресу из манифеста сборки
await setTheme('${themes.find(theme => theme.build === 'built')?.entry.id ?? defaultTheme}')
toggleMode()`
</script>

<template>
  <div class="mx-auto flex max-w-[1360px] flex-col gap-12 px-4 py-10 lg:px-10">
    <PageHeader
      eyebrow="Темы"
      title="Каталог тем"
      lead="Тема — полный набор значений дизайн-языка: примитивы, роли каждого режима, значения компонентов и пропсы, которые она им включает. Компоненты и их API общие — меняется только тема."
    >
      <dl class="mt-2 grid max-w-[720px] grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="flex flex-col gap-0.5">
          <dt class="order-2 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ stat.label }}
          </dt>
          <dd class="order-1 text-[length:var(--gr-text-2xl)] font-600 leading-[var(--gr-leading-xl)] [font-variant-numeric:tabular-nums]">
            {{ stat.value }}
          </dd>
        </div>
      </dl>
    </PageHeader>

    <section class="flex flex-col gap-4" aria-labelledby="catalog-title">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="flex flex-col gap-1">
          <h2 id="catalog-title" class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)] tracking-[-0.01em]">
            Темы
          </h2>
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
            Один и тот же интерфейс в каждой теме — на настоящих компонентах пакета.
          </p>
        </div>
        <GrSegmented v-model="specimenMode" size="sm" aria-label="Режим образцов" :options="modeOptions" />
      </div>
      <ul class="grid gap-4 md:grid-cols-2">
        <li v-for="theme in themes" :key="theme.entry.id">
          <ThemeCatalogCard :theme="theme" :mode="specimenMode" :current="theme.entry.id === current" />
        </li>
      </ul>
    </section>

    <DocSection title="Темы рядом" lead="Паспорт и то, чем темы различаются на деле. Значения — из данных тем, главный цвет посчитан браузером в каждом режиме.">
      <GrAlert v-if="error" tone="danger" title="Данные тем не загрузились">
        {{ error }}
      </GrAlert>
      <ThemesComparison :themes="themes" :views="views" :current="current" />
    </DocSection>

    <DocSection title="Подключение" lead="Сборка выбирает темы и режимы; основная лежит в общем листе, остальные — своими листами, и рантайм переключает их без перезагрузки.">
      <div class="grid gap-4 lg:grid-cols-2">
        <CodeBlock :code="configSnippet" caption="Сборка" />
        <CodeBlock :code="runtimeSnippet" caption="Переключение" />
      </div>
    </DocSection>
  </div>
</template>
