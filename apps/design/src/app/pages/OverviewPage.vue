<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { grFoundationTokens, grRoleTokens, grThemeCatalog } from '@feugene/granularity-tokens'
import IconArrowRight from '~icons/lucide/arrow-right'

import { catalog, conceptVersions } from '../catalog'
import { foundations } from '../foundations'
import DocSection from '../parts/DocSection.vue'
import PageHeader from '../parts/PageHeader.vue'
import { plural } from '../plural'

const principles = [
  {
    title: 'Цвет — через роль',
    text: 'Компонент берёт поверхность карточки, а не оттенок шкалы: роль перекрашивается темой, оттенок — нет.',
  },
  {
    title: 'Недоступное — без прозрачности',
    text: 'Прозрачность разбавляет выверенные на AA цвета. Недоступный контрол гасится своими токенами.',
  },
  {
    title: 'Фокус — с клавиатуры',
    text: 'Контур 2px с отступом — только при навигации с клавиатуры. Он переживает режим высокой контрастности.',
  },
  {
    title: 'Две шкалы текста',
    text: 'Контент и контролы набираются разными шкалами. Кнопка и поле одной ступени — одной высоты.',
  },
]

const stats = [
  { value: grRoleTokens.length, label: 'ролей темы' },
  { value: grFoundationTokens.length, label: 'примитивов' },
  { value: grThemeCatalog.length, label: plural(grThemeCatalog.length, ['тема', 'темы', 'тем']).replace(/^\d+ /, '') },
  { value: catalog.reduce((sum, item) => sum + item.versions.length, 0), label: 'версий макетов' },
]
</script>

<template>
  <div class="mx-auto flex max-w-[1360px] flex-col gap-14 px-4 py-10 lg:px-10">
    <PageHeader
      eyebrow="@feugene/granularity"
      title="Дизайн-система"
      lead="Правила, по которым собраны компоненты пакета: роли цвета, шкалы, движение и доступность. У компонента — живая спецификация реализованной версии и макеты экспериментальных."
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

    <DocSection title="Принципы">
      <ul class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <li
          v-for="principle in principles"
          :key="principle.title"
          class="flex flex-col gap-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5"
        >
          <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            {{ principle.title }}
          </h3>
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
            {{ principle.text }}
          </p>
        </li>
      </ul>
    </DocSection>

    <DocSection title="Компоненты" lead="Страница компонента — его спецификация на настоящих компонентах пакета и макеты всех версий дизайна.">
      <ul class="grid gap-4 md:grid-cols-2">
        <li v-for="component in catalog" :key="component.id">
          <RouterLink :to="`/components/${component.id}`" class="overview-card">
            <span class="flex items-center justify-between gap-3">
              <span class="text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">{{ component.name }}</span>
              <GrIcon class="text-[var(--gr-muted-fg)]"><IconArrowRight /></GrIcon>
            </span>
            <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">{{ component.summary }}</span>
            <span class="flex flex-wrap gap-1.5">
              <GrBadge tone="success" size="sm">в пакете</GrBadge>
              <GrBadge tone="warning" size="sm">
                {{ plural(conceptVersions(component).length, ['концепт', 'концепта', 'концептов']) }}
              </GrBadge>
            </span>
          </RouterLink>
        </li>
      </ul>
    </DocSection>

    <DocSection title="Основы">
      <ul class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <li v-for="foundation in foundations" :key="foundation.id">
          <RouterLink :to="`/foundations/${foundation.id}`" class="overview-card">
            <span class="flex items-center gap-2">
              <GrIcon class="text-[var(--gr-primary-text)]"><component :is="foundation.icon" /></GrIcon>
              <span class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">{{ foundation.title }}</span>
            </span>
            <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">{{ foundation.summary }}</span>
          </RouterLink>
        </li>
      </ul>
    </DocSection>
  </div>
</template>

<style scoped>
.overview-card {
  display: flex;
  flex-direction: column;
  gap: var(--gr-space-2);
  height: 100%;
  padding: var(--gr-space-5);
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-lg);
  background: var(--gr-card);
  color: var(--gr-fg);
  transition:
    border-color var(--gr-duration-fast) var(--gr-ease-out),
    box-shadow var(--gr-duration-fast) var(--gr-ease-out);
}

.overview-card:hover {
  border-color: var(--gr-control-brd);
  box-shadow: var(--gr-shadow-1);
}

.overview-card:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}
</style>
