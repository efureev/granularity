<script setup lang="ts">
import { computed } from 'vue'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import {
  GrButton,
  GrCard,
} from '@feugene/granularity'

import CodeBlock from '../components/doc/CodeBlock.vue'
import {
  showcaseInstallationNarrative,
  showcaseQuickStartCards,
} from '../content/foundations'
import InlineRichText from "../components/content/InlineRichText.vue";

const { t } = useFintI18n()

const overviewFeatureList = computed(() =>
  [0, 1, 2, 3].map(index => ({
    title: t(`showcase.overviewPage.features.${index}.title`),
    description: t(`showcase.overviewPage.features.${index}.description`),
  })),
)
</script>

<template>
  <div class="space-y-8">
    <GrCard class="showcase-panel rounded-[32px] border p-6 lg:p-7">
      <div class="space-y-5">
        <div class="max-w-3xl space-y-3">
          <h1 class="text-3xl font-semibold leading-tight lg:text-4xl mb-3">
            Granularity
          </h1>
          <InlineRichText :text="t('showcase.overviewPage.tagline')" />
        </div>

        <div class="flex flex-wrap gap-3">
          <RouterLink to="/foundations" custom v-slot="{ navigate, href }">
            <GrButton :href="href" @click="navigate">
              {{ t('showcase.overviewPage.ctaFoundations') }}
            </GrButton>
          </RouterLink>
          <RouterLink to="/components" custom v-slot="{ navigate, href }">
            <GrButton variant="ghost-border" :href="href" @click="navigate">
              {{ t('showcase.overviewPage.ctaComponents') }}
            </GrButton>
          </RouterLink>
        </div>
      </div>
    </GrCard>

    <section class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">{{ t('showcase.overviewPage.whyTitle') }}</h2>
      </div>

      <GrCard class="showcase-panel overflow-hidden rounded-[32px] border p-6 lg:p-8">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold leading-tight">
            {{ t('showcase.overviewPage.whyHeading') }}
          </h3>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 mt-5 gap-6">
          <div
              v-for="(feature, index) in overviewFeatureList"
              :key="feature.title"
              class="showcase-panel-emphasis showcase-shadow-raised rounded-3xl border p-5 backdrop-blur-sm"
          >
            <h4 class="flex items-center gap-3 text-base font-semibold leading-6">
                <span
                    class="inline-flex h-8 w-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-semibold text-[var(--primary-fg)]">
                  0{{ index + 1 }}
                </span>
              {{ feature.title }}
            </h4>
            <p class="showcase-text-muted text-sm leading-6 mt-3">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </GrCard>
    </section>

    <section id="quick-start" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">{{ t('showcase.overviewPage.quickStartTitle') }}</h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          {{ t('showcase.overviewPage.quickStartSubtitle') }}
        </p>
      </div>

      <div class="grid gap-6">
        <GrCard
            v-for="card in showcaseQuickStartCards"
            :id="card.id"
            :key="card.id"
            class="showcase-panel rounded-3xl border p-6"
        >
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h3 class="text-xl font-semibold">
                {{ card.title }}
              </h3>
              <RouterLink to="/foundations"
                          class="showcase-text-primary text-xs font-semibold uppercase tracking-[0.16em] transition-colors">
                {{ t('showcase.overviewPage.foundationsLink') }}
              </RouterLink>
            </div>
            <p class="showcase-text-muted text-sm leading-6">
              {{ card.description }}
            </p>
            <CodeBlock :code="card.code" :language="card.language" :title="card.title"/>
            <p class="showcase-text-subtle text-sm leading-6">
              {{ card.note }}
            </p>
          </div>
        </GrCard>
      </div>

      <GrCard class="showcase-panel rounded-3xl border p-6">
        <div class="space-y-3">
          <h2 class="text-2xl font-semibold">{{ t('showcase.overviewPage.installSummaryTitle') }}</h2>
          <p class="showcase-text-muted max-w-3xl text-sm leading-6">
            {{ t('showcase.overviewPage.installSummaryText') }}
          </p>
          <CodeBlock :code="showcaseInstallationNarrative" language="md" :title="t('showcase.overviewPage.installGuideExcerptTitle')"/>
        </div>
      </GrCard>
    </section>
  </div>
</template>
