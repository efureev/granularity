<script setup lang="ts">
import {computed, ref} from 'vue'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import {DsBadge, DsCard, DsLink, DsSwitch} from '@feugene/granularity'

import InlineRichText from '../components/content/InlineRichText.vue'
import CodeBlock from '../components/doc/CodeBlock.vue'
import {
  showcaseFoundationGuides,
  showcaseFoundationTokens,
  showcaseQuickStartCards,
  showcaseThemeTokens,
} from '../content/foundations'
import IconChevronDown from '~icons/lucide/chevron-down'
import IconChevronRight from '~icons/lucide/chevron-right'
import IconHash from '~icons/lucide/hash'

const i18n = useFintI18n()
const preferredQuickStartCardId = 'quick-start-uno-node'
const guidesWithoutNarrativeDocs = new Set([
  'styling',
  'themes',
  'tokens',
  'unocss',
  'localization',
])
const foundationTokenSectionOrder = [...new Set(showcaseFoundationTokens.map(token => token.section))]
const collapsedFoundationSections = ref<Record<string, boolean>>(
  Object.fromEntries(foundationTokenSectionOrder.map(section => [section, true])),
)
const foundationTokenGroups = computed(() => foundationTokenSectionOrder.map(section => ({
  section,
  tokens: showcaseFoundationTokens.filter(token => token.section === section),
})))
const isDarkThemePreview = ref(false)
const activeThemeName = computed(() => isDarkThemePreview.value ? 'dark' : 'light')
const activeThemeLabel = computed(() => i18n.t(`showcase.foundationsPage.theme.${activeThemeName.value}`))
const themeTokenSectionOrder = [...new Set(showcaseThemeTokens.map(token => token.section))]
const collapsedThemeSections = ref<Record<string, boolean>>(
  Object.fromEntries(themeTokenSectionOrder.map(section => [section, true])),
)
const themeTokenGroups = computed(() => themeTokenSectionOrder.map(section => ({
  section,
  tokens: showcaseThemeTokens.filter(token => token.section === section),
})))
const themePreviewContainerStyle = computed(() => {
  if (activeThemeName.value === 'dark')
    return undefined

  const lightThemeTokenEntries = showcaseThemeTokens.map(token => {
    const currentValue = token.values.light.value

    return `${token.name}: ${currentValue}`
  })

  return lightThemeTokenEntries.join('; ')
})

function getVisibleCodeSamples(guide: (typeof showcaseFoundationGuides)[number]) {
  return guide.codeSamples.filter(codeSample => {
    if (codeSample.language === 'md')
      return false

    return !((guide.id === 'themes' || guide.id === 'tokens') && codeSample.language === 'css')
  })
}

function getTokenDisplayValue(value: string, hexValue: string | null) {
  return hexValue ?? value
}

function getActiveThemeTokenValue(token: (typeof showcaseThemeTokens)[number]) {
  return token.values[activeThemeName.value]
}

function toggleFoundationTokenSection(section: string) {
  collapsedFoundationSections.value[section] = !collapsedFoundationSections.value[section]
}

function toggleThemeTokenSection(section: string) {
  collapsedThemeSections.value[section] = !collapsedThemeSections.value[section]
}

function getSectionToggleAriaLabel(section: string, isCollapsed: boolean) {
  return `${i18n.t(`showcase.foundationsPage.${isCollapsed ? 'expandSection' : 'collapseSection'}`)} ${section}`
}
</script>

<template>
  <div class="space-y-8">
    <DsCard class="showcase-panel rounded-3xl border p-8">
      <div class="space-y-4">
        <h1 class="max-w-4xl text-1xl font-semibold leading-tight lg:text-2xl">
          {{ $t('showcase.foundationsPage.heroTitle') }}
        </h1>
        <p class="showcase-text-muted max-w-3xl text-base leading-7">
          {{ $t('showcase.foundationsPage.heroDescription') }}
        </p>
      </div>
    </DsCard>

    <section id="installation" class="space-y-6 scroll-mt-28">
      <DsCard class="showcase-panel rounded-3xl border p-6">
        <div class="space-y-3">
          <h2 class="text-2xl font-semibold">{{ $t('showcase.foundationsPage.installationTitle') }}</h2>
          <CodeBlock
            code="yarn add @feugene/granularity vue"
            language="bash"
            :title="$t('showcase.foundationsPage.installPackageTitle')"
          />
        </div>
      </DsCard>

      <DsCard class="showcase-panel rounded-3xl border p-6">
        <div class="space-y-4">
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold">{{ $t('showcase.foundationsPage.quickStartTitle') }}</h2>
            <p class="showcase-text-muted text-sm leading-6">
              <InlineRichText :text="$t('showcase.foundationsPage.quickStartDescription')"/>
            </p>
          </div>

          <div class="grid gap-4">
            <DsCard
                v-for="card in showcaseQuickStartCards"
                :key="card.id"
                class="showcase-panel-soft rounded-3xl border p-5"
            >
              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-3">
                  <h3 class="text-lg font-semibold">
                    <InlineRichText :text="card.title"/>
                  </h3>
                  <DsBadge variant="primary" dark v-if="card.id === preferredQuickStartCardId">
                    {{ $t('showcase.foundationsPage.preferredMethod') }}
                  </DsBadge>
                </div>
                <p class="showcase-text-muted text-sm leading-6">
                  <InlineRichText :text="card.description"/>
                </p>
                <CodeBlock :code="card.code" :language="card.language" :title="card.title"/>
                <p class="showcase-text-subtle text-sm leading-6">
                  <InlineRichText :text="card.note"/>
                </p>
              </div>
            </DsCard>
          </div>
        </div>
      </DsCard>
    </section>

    <section
        v-for="guide in showcaseFoundationGuides"
        :id="guide.id"
        :key="guide.id"
        class="scroll-mt-28"
    >
      <DsCard class="showcase-panel rounded-3xl border p-6">
        <div class="space-y-5">
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-2xl font-semibold">
                {{ guide.title }}
              </h2>
              <DsLink
                  :href="`#${guide.id}`"
                  variant="muted"
                  class="px-1 text-xs">
                <IconHash/>
              </DsLink>
            </div>
            <p class="showcase-text-muted text-base leading-7">
              <InlineRichText :text="guide.summary"/>
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-lg font-semibold">{{ $t('showcase.foundationsPage.keyPointsTitle') }}</h3>
              <ul class="grid gap-3">
                <li
                    v-for="item in guide.keyPoints"
                    :key="item"
                    class="showcase-inline-surface rounded-2xl border px-4 py-3 text-sm leading-6"
                >
                  <InlineRichText :text="item"/>
                </li>
              </ul>
            </div>

            <div class="space-y-3">
              <h3 class="text-lg font-semibold">{{ $t('showcase.foundationsPage.recommendationsTitle') }}</h3>
              <ul class="grid gap-3">
                <li
                    v-for="item in guide.recommendations"
                    :key="item"
                    class="showcase-panel-emphasis rounded-2xl border px-4 py-3 text-sm leading-6"
                >
                  <InlineRichText :text="item"/>
                </li>
              </ul>
            </div>
          </div>

          <div v-if="!guidesWithoutNarrativeDocs.has(guide.id) && guide.narrativeSource" class="space-y-4">
            <CodeBlock
              :code="guide.narrativeSource"
              language="md"
              :title="$t('showcase.foundationsPage.connectedDocExcerptTitle')"
            />
          </div>

          <div v-if="guide.id === 'tokens'" class="space-y-4">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold">{{ $t('showcase.foundationsPage.currentTokenRegistryTitle') }}</h3>
              <p class="showcase-text-muted text-sm leading-6">
                {{ $t('showcase.foundationsPage.currentTokenRegistryDescription') }}
              </p>
            </div>

            <div class="showcase-panel rounded-3xl border p-4">
              <div class="space-y-4">
                <section
                    v-for="group in foundationTokenGroups"
                    :key="group.section"
                    class="showcase-panel-soft overflow-hidden rounded-3xl border"
                >
                  <div class="flex items-center justify-between gap-4 px-5 py-4">
                    <div class="space-y-1">
                      <h4 class="text-base font-semibold">{{ group.section }}</h4>
                      <p class="showcase-text-subtle text-xs">
                        {{ group.tokens.length }} {{ $t('showcase.foundationsPage.tokensCount') }}
                      </p>
                    </div>

                    <button
                        type="button"
                        class="showcase-panel flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[var(--showcase-surface-muted)]"
                        :aria-expanded="!collapsedFoundationSections[group.section]"
                        :aria-label="getSectionToggleAriaLabel(group.section, collapsedFoundationSections[group.section])"
                        @click="toggleFoundationTokenSection(group.section)"
                    >
                      <component
                          :is="collapsedFoundationSections[group.section] ? IconChevronRight : IconChevronDown"
                          class="h-4 w-4"
                      />
                    </button>
                  </div>

                  <div v-if="!collapsedFoundationSections[group.section]" class="overflow-x-auto border-t showcase-border-strong">
                    <table class="min-w-full border-collapse text-left text-sm">
                      <thead class="showcase-table-head">
                      <tr>
                        <th class="min-w-[200px] px-5 py-3 font-semibold">{{ $t('showcase.foundationsPage.table.token') }}</th>
                        <th class="px-5 py-3 font-semibold">{{ $t('showcase.foundationsPage.table.value') }}</th>
                        <th class="px-5 py-3 font-semibold">{{ $t('showcase.foundationsPage.table.description') }}</th>
                      </tr>
                      </thead>

                      <tbody>
                      <tr
                          v-for="token in group.tokens"
                          :key="token.name"
                          class="showcase-border-strong border-t align-top"
                      >
                        <td class="min-w-[200px] px-5 py-4 font-semibold">
                          <code>{{ token.name }}</code>
                        </td>

                        <td class="px-5 py-4">
                          <div class="flex min-w-[220px] items-center gap-3">
                              <span
                                  class="h-8 w-8 shrink-0 rounded-xl border"
                                  :style="{
                                    backgroundColor: token.hexValue ?? 'var(--showcase-surface-muted)',
                                    borderColor: token.hexValue
                                      ? 'color-mix(in srgb, var(--fg) 12%, transparent)'
                                      : 'var(--showcase-brd-strong)',
                                  }"
                              />

                            <code class="showcase-text-muted text-xs leading-5">
                              {{ getTokenDisplayValue(token.value, token.hexValue) }}
                            </code>
                          </div>
                        </td>

                        <td class="showcase-text-muted px-5 py-4">
                          <div class="space-y-1">
                            <p>{{ token.description }}</p>
                            <p class="showcase-text-subtle text-xs">
                              {{ $t('showcase.foundationsPage.table.source') }}: `tokens.css`
                            </p>
                          </div>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div v-if="guide.id === 'themes'" class="space-y-4">
            <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div class="space-y-2">
                <h3 class="text-lg font-semibold">{{ $t('showcase.foundationsPage.currentThemeRegistryTitle') }}</h3>
                <p class="showcase-text-muted max-w-3xl text-sm leading-6">
                  {{ $t('showcase.foundationsPage.currentThemeRegistryDescription') }}
                </p>
              </div>

              <DsCard class="showcase-panel-soft min-w-[220px] rounded-3xl border px-4 py-3">
                <div class="flex items-center justify-between gap-4">
                  <div class="text-sm font-semibold">{{ $t('showcase.foundationsPage.themeLabel') }}</div>
                  <div class="text-sm">{{ activeThemeLabel }}</div>
                  <DsSwitch v-model="isDarkThemePreview" size="sm"/>
                </div>
              </DsCard>
            </div>

            <div
                :data-theme="activeThemeName === 'dark' ? 'dark' : undefined"
                :style="themePreviewContainerStyle"
                class="showcase-panel rounded-3xl border p-4"
            >
              <div class="space-y-4">
                <section
                    v-for="group in themeTokenGroups"
                    :key="group.section"
                    class="showcase-panel-soft overflow-hidden rounded-3xl border"
                >
                  <div class="flex items-center justify-between gap-4 px-5 py-4">
                    <div class="space-y-1">
                      <h4 class="text-base font-semibold">{{ group.section }}</h4>
                      <p class="showcase-text-subtle text-xs">
                        {{ group.tokens.length }} {{ $t('showcase.foundationsPage.tokensCount') }}
                      </p>
                    </div>

                    <button
                        type="button"
                        class="showcase-panel flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[var(--showcase-surface-muted)]"
                        :aria-expanded="!collapsedThemeSections[group.section]"
                        :aria-label="getSectionToggleAriaLabel(group.section, collapsedThemeSections[group.section])"
                        @click="toggleThemeTokenSection(group.section)"
                    >
                      <component
                          :is="collapsedThemeSections[group.section] ? IconChevronRight : IconChevronDown"
                          class="h-4 w-4"
                      />
                    </button>
                  </div>

                  <div v-if="!collapsedThemeSections[group.section]" class="overflow-x-auto border-t showcase-border-strong">
                    <table class="min-w-full border-collapse text-left text-sm">
                      <thead class="showcase-table-head">
                      <tr>
                        <th class="min-w-[200px] px-5 py-3 font-semibold">{{ $t('showcase.foundationsPage.table.token') }}</th>
                        <th class="px-5 py-3 font-semibold">{{ $t('showcase.foundationsPage.table.value') }}</th>
                        <th class="px-5 py-3 font-semibold">{{ $t('showcase.foundationsPage.table.description') }}</th>
                      </tr>
                      </thead>

                      <tbody>
                      <tr
                          v-for="token in group.tokens"
                          :key="token.name"
                          class="showcase-border-strong border-t align-top"
                      >
                        <td class="min-w-[200px] px-5 py-4 font-semibold">
                          <code>{{ token.name }}</code>
                        </td>

                        <td class="px-5 py-4">
                          <div class="flex min-w-[220px] items-center gap-3">
                              <span
                                  class="h-8 w-8 shrink-0 rounded-xl border"
                                  :style="{
                                    backgroundColor: getActiveThemeTokenValue(token).hexValue ?? 'var(--showcase-surface-muted)',
                                    borderColor: getActiveThemeTokenValue(token).hexValue
                                      ? 'color-mix(in srgb, var(--fg) 12%, transparent)'
                                      : 'var(--showcase-brd-strong)',
                                  }"
                              />

                            <code class="showcase-text-muted text-xs leading-5">
                              {{
                                getTokenDisplayValue(getActiveThemeTokenValue(token).value, getActiveThemeTokenValue(token).hexValue)
                              }}
                            </code>
                          </div>
                        </td>

                        <td class="showcase-text-muted px-5 py-4">
                          <div class="space-y-1">
                            <p>{{ token.description }}</p>
                            <p class="showcase-text-subtle text-xs">
                              {{ $t('showcase.foundationsPage.table.source') }}: <code>{{ activeThemeName }}.css</code>
                            </p>
                          </div>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-4">
          <CodeBlock
              v-for="sample in getVisibleCodeSamples(guide)"
              :key="`${guide.id}-${sample.title}`"
              :code="sample.code"
              :language="sample.language"
              :title="sample.title"
          />
        </div>
      </DsCard>
    </section>
  </div>
</template>