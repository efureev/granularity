<script setup lang="ts">
import { GrBreadcrumbs, type GrBreadcrumbItem } from '@feugene/granularity'

const path: GrBreadcrumbItem[] = [
  { label: 'Home', href: '#/', icon: 'i-lucide-house' },
  { label: 'Team', href: '#/team', icon: 'i-lucide-users' },
  { label: 'Ada Lovelace', icon: 'i-lucide-user' },
]

/**
 * Все четыре вида пункта в одном пути: пункт-иконка, ссылка без иконки, ссылка
 * с иконкой и обычный пункт без ссылки.
 */
const mixed: GrBreadcrumbItem[] = [
  { label: 'Главная', href: '#/', icon: 'i-lucide-house', iconOnly: true },
  { label: 'Проекты', href: '#/projects' },
  { label: 'Гранулярность', href: '#/projects/granularity', icon: 'i-lucide-box' },
  { label: 'Настройки' },
]

/** Короткий путь второго уровня: домик и страница. */
const short: GrBreadcrumbItem[] = [
  { label: 'Главная', href: '#/', icon: 'i-lucide-house', iconOnly: true },
  { label: 'Профиль' },
]
</script>

<template>
  <div class="grid gap-5">
    <GrBreadcrumbs :items="path" separator="›" size="lg" />

    <GrBreadcrumbs :items="mixed" size="lg" />

    <GrBreadcrumbs :items="short" size="lg" />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Первый пункт второго и третьего пути — <code>iconOnly</code>: видна только иконка. Подпись при
      этом не выброшена, а спрятана <code>sr-only</code> — путь читают и поиском, и диктором, и
      «домик» без имени сделал бы первый пункт для незрячего пустым.
    </p>
  </div>
</template>
