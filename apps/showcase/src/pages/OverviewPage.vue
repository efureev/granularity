<script setup lang="ts">
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

const overviewFeatureList = [
  {
    title: 'Быстрее собирает продуктовые интерфейсы',
    description:
        'Готовые компоненты, токены и темы снимают с команды рутину и ускоряют запуск экранов.',
  },
  {
    title: 'Подключается без жёсткого миграционного сценария',
    description:
        'Можно начать с простого импорта, а затем перейти к granular imports и точному CSS-сценарию по мере роста продукта.',
  },
  {
    title: 'Даёт аккуратный контроль над стилями и bundle',
    description:
        'Понятные слои стилей, subpath exports и интеграция с UnoCSS помогают не терять управляемость.',
  },
  {
    title: 'Подходит и для быстрого старта, и для зрелой инфраструктуры',
    description:
        'Один пакет закрывает сценарии от нескольких готовых компонентов до dependency-aware интеграции.',
  },
]
</script>

<template>
  <div class="space-y-8">
    <GrCard class="showcase-panel rounded-[32px] border p-6 lg:p-7">
      <div class="space-y-5">
        <div class="max-w-3xl space-y-3">
          <h1 class="text-3xl font-semibold leading-tight lg:text-4xl mb-3">
            Granularity
          </h1>
          <InlineRichText
              text="Витрина дизайн-системы для Vue 3: готовые компоненты, понятные слои стилей, granular imports и аккуратная
            интеграция с `UnoCSS`."
          />
        </div>

        <div class="flex flex-wrap gap-3">
          <RouterLink to="/foundations" custom v-slot="{ navigate, href }">
            <GrButton :href="href" @click="navigate">
              Открыть foundations
            </GrButton>
          </RouterLink>
          <RouterLink to="/components" custom v-slot="{ navigate, href }">
            <GrButton variant="ghost-border" :href="href" @click="navigate">
              Каталог компонентов
            </GrButton>
          </RouterLink>
        </div>
      </div>
    </GrCard>

    <section class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">Почему Granularity</h2>
      </div>

      <GrCard class="showcase-panel overflow-hidden rounded-[32px] border p-6 lg:p-8">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold leading-tight">
            Всё, что нужно, чтобы дизайн-система помогала команде, а не тормозила её
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
        <h2 class="text-2xl font-semibold">Быстрый старт</h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          Пять документированных сценариев подключения: от root import до UnoCSS preset-ов.
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
                Foundations
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
          <h2 class="text-2xl font-semibold">Коротко об установке</h2>
          <p class="showcase-text-muted max-w-3xl text-sm leading-6">
            Ниже — короткая выдержка из документации, которая помогает быстро выбрать подход к подключению.
          </p>
          <CodeBlock :code="showcaseInstallationNarrative" language="md" title="Installation guide excerpt"/>
        </div>
      </GrCard>
    </section>
  </div>
</template>