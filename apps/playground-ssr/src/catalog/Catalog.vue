<script setup lang="ts">
import { GrBadge, GrCard } from '@feugene/granularity'

import { componentPath, FIXTURE_PACKAGES } from './fixtures'

/**
 * Корень стенда: карта всех страниц.
 *
 * Каталог, а не демонстрация. Тематические страницы живут в шапке — их немного,
 * и они собраны под класс дефектов; страниц компонентов сотня, и в шапке они
 * превратились бы в стену ссылок на каждой странице стенда.
 *
 * Собран из компонентов пакета намеренно: страница попадает в снимок и в
 * гидрацию наравне с остальными, то есть заодно проверяет `GrCard` и `GrBadge`
 * в связке, а не поодиночке.
 */
const packages = FIXTURE_PACKAGES.filter(pkg => pkg.fixtures.length > 0)

const total = packages.reduce((sum, pkg) => sum + pkg.fixtures.length, 0)
</script>

<template>
  <main class="min-h-[100dvh] bg-[var(--gr-bg)] px-4 py-8 text-[var(--gr-fg)] sm:px-6">
    <div class="mx-auto grid max-w-[1180px] gap-6">
      <header class="grid gap-2">
        <div class="flex flex-wrap items-baseline gap-3">
          <h1 class="m-0 text-[length:var(--gr-text-2xl)] leading-[var(--gr-leading-tight)] font-600">
            Компоненты экосистемы
          </h1>
          <GrBadge tone="primary">
            {{ total }}
          </GrBadge>
        </div>

        <p class="m-0 max-w-[76ch] text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-relaxed)] text-[var(--gr-muted-fg)]">
          Один адрес — один компонент. Изоляция здесь не аккуратность, а условие измерения:
          на общей странице падение одного компонента уносит рендер всей, а расхождение
          гидрации не указывает на виновника. Тематические страницы — в шапке.
        </p>
      </header>

      <GrCard
        v-for="pkg in packages"
        :key="pkg.key"
        variant="outlined"
        padding="md"
        :title="pkg.title"
        :heading-level="2"
        body-class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
      >
        <template #actions>
          <GrBadge>{{ pkg.fixtures.length }}</GrBadge>
        </template>

        <a
          v-for="fixture in pkg.fixtures"
          :key="fixture.name"
          :href="componentPath(fixture.name)"
          class="grid gap-0.5 rounded-[var(--gr-radius-md)] border border-transparent px-3 py-2 no-underline transition-colors duration-[var(--gr-duration-fast)] hover:border-[var(--gr-brd)] hover:bg-[var(--gr-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        >
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600 text-[var(--gr-fg)]">
            {{ fixture.name }}
          </span>
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-relaxed)] text-[var(--gr-muted-fg)]">
            {{ fixture.about }}
          </span>
        </a>
      </GrCard>
    </div>
  </main>
</template>
