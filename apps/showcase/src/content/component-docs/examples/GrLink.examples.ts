import type { ShowcaseComponentExampleDoc } from '../types'

export const grLinkExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'link-builder',
    title: 'Interactive link constructor',
    description: 'Соберите `GrLink` под ваш сценарий: переключайте tone, underline, size, навигационные атрибуты и сразу смотрите итоговый snippet.',
    status: 'ready',
    previewKey: 'gr-link-builder',
    code: '',
  },
  {
    id: 'link-variants',
    title: 'Variants and underline modes',
    description: 'На витрине важно сравнить `tone`, `underline` и size contract, потому что `GrLink` часто используется как inline action вместо кнопки.',
    status: 'ready',
    previewKey: 'gr-link-variants',
    code: `<script setup lang="ts">
import { GrLink } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 text-sm">
    <GrLink href="#" variant="primary" size="md">Primary navigation link</GrLink>
    <GrLink href="#" variant="default" size="md">Default inline action</GrLink>
    <GrLink href="#" variant="muted" underline="always" size="md">Muted persistent underline</GrLink>
    <GrLink href="#" variant="danger" size="md">Destructive secondary action</GrLink>
  </div>
</template>`,
  },
  {
    id: 'link-external',
    title: 'Внешние ссылки и смена контекста',
    description: 'Ссылка, открывающаяся в новой вкладке, сама получает иконку, безопасный `rel` и скрытое предупреждение о смене контекста (WCAG 3.2.5).',
    status: 'ready',
    previewKey: 'gr-link-external',
    code: `<script setup lang="ts">
import { GrLink } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 text-sm">
    <GrLink href="https://example.com/docs/showcase" external size="md">
      Open external documentation
    </GrLink>

    <!-- Условие — фактическое поведение ссылки, а не проп \`external\`. -->
    <GrLink href="https://example.com/changelog" target="_blank" size="md">
      Changelog в новой вкладке
    </GrLink>

    <GrLink href="https://example.com/rss" external :external-icon="false" size="md">
      Без иконки, но с предупреждением для скринридера
    </GrLink>

    <div class="rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-4 text-[var(--gr-muted-fg)]">
      Ссылка, открывающаяся в новой вкладке, сама получает иконку, безопасный \`rel\` и скрытую
      подсказку «откроется в новой вкладке» — предупреждение о смене контекста (WCAG 3.2.5).
    </div>
  </div>
</template>`,
  },
  {
    id: 'link-disabled-states',
    title: 'Disabled and muted states',
    description: 'Отдельно показываем disabled/muted сценарии, чтобы было понятно, как `GrLink` деградирует до неинтерактивного inline элемента.',
    status: 'ready',
    previewKey: 'gr-link-disabled-states',
    code: `<script setup lang="ts">
import { GrLink } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <GrLink href="#" size="md">Ready link</GrLink>
    <GrLink href="#" disabled size="md">Disabled link</GrLink>
    <GrLink href="#" underline="none" variant="muted" size="md">Muted helper link</GrLink>
  </div>
</template>`,
  },
]
