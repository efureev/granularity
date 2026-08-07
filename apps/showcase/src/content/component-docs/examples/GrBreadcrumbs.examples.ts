import type { ShowcaseComponentExampleDoc } from '../types'

export const grBreadcrumbsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'breadcrumbs-basic',
    title: 'Path to the current page',
    description: 'Базовый сценарий: путь от корня до текущей страницы. Последний пункт — не ссылка: он помечен `aria-current="page"`, и именно так скринридер отвечает на вопрос «где я сейчас».',
    status: 'ready',
    previewKey: 'gr-breadcrumbs-basic',
    code: `<script setup lang="ts">
import { GrBreadcrumbs, type GrBreadcrumbItem } from '@feugene/granularity'

const path: GrBreadcrumbItem[] = [
  { label: 'Dashboard', href: '#/dashboard' },
  { label: 'Projects', href: '#/projects' },
  { label: 'Granularity', href: '#/projects/granularity' },
  { label: 'Settings' },
]
</script>

<template>
  <GrBreadcrumbs :items="path" />
</template>`,
  },
  {
    id: 'breadcrumbs-collapsed',
    title: 'Long path with a collapsed middle',
    description: '`max-items` сворачивает середину пути в «…», `items-before-collapse` и `items-after-collapse` решают, сколько уровней остаётся по краям. Клик по многоточию раскрывает путь на месте и переводит фокус на первый раскрытый пункт — кнопка исчезает вместе со схлопыванием.',
    status: 'ready',
    previewKey: 'gr-breadcrumbs-collapsed',
    code: `<script setup lang="ts">
import { GrBreadcrumbs, type GrBreadcrumbItem } from '@feugene/granularity'

// Длинный путь из файлового менеджера: середина сворачивается, начало и конец
// остаются на виду.
const path: GrBreadcrumbItem[] = [
  { label: 'Storage', href: '#/storage' },
  { label: 'Workspaces', href: '#/storage/workspaces' },
  { label: 'Design system', href: '#/storage/workspaces/design-system' },
  { label: 'Releases', href: '#/storage/workspaces/design-system/releases' },
  { label: '0.15.0', href: '#/storage/workspaces/design-system/releases/0-15-0' },
  { label: 'CHANGELOG.md' },
]
</script>

<template>
  <GrBreadcrumbs
    :items="path"
    :max-items="4"
    :items-before-collapse="1"
    :items-after-collapse="2"
  />
</template>`,
  },
  {
    id: 'breadcrumbs-icons',
    title: 'Icons, custom separator and size',
    description: 'Иконка пункта задаётся классом в поле `icon` и остаётся декоративной, разделитель меняется пропом `separator`, размер — общей шкалой пакета или глобально через `GrConfigProvider`.',
    status: 'ready',
    previewKey: 'gr-breadcrumbs-icons',
    code: `<script setup lang="ts">
import { GrBreadcrumbs, type GrBreadcrumbItem } from '@feugene/granularity'

const path: GrBreadcrumbItem[] = [
  { label: 'Home', href: '#/', icon: 'i-lucide-house' },
  { label: 'Team', href: '#/team', icon: 'i-lucide-users' },
  { label: 'Ada Lovelace', icon: 'i-lucide-user' },
]
</script>

<template>
  <GrBreadcrumbs :items="path" separator="›" size="lg" />
</template>`,
  },
]
