import type { ShowcaseComponentExampleDoc } from '../types'

export const dsAvatarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'avatar-size-shape',
    title: 'Sizes and circle/square shapes',
    description: 'Минимальный набор размеров и форм помогает быстро понять, как `DsAvatar` ведёт себя для людей и для team/workspace сущностей.',
    status: 'ready',
    previewKey: 'ds-avatar-size-shape',
    code: `<script setup lang="ts">
import { DsAvatar } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <DsAvatar :size="32">AD</DsAvatar>
    <DsAvatar :size="40">AD</DsAvatar>
    <DsAvatar :size="56">AD</DsAvatar>
    <DsAvatar :size="72">AD</DsAvatar>
    <DsAvatar :size="56" shape="square">QA</DsAvatar>
  </div>
</template>`,
  },
  {
    id: 'avatar-image-fallback',
    title: 'Image mode with default-slot fallback',
    description: 'Показываем основной contract компонента: `src` рендерит изображение, а при его отсутствии тот же размер сохраняется для fallback-контента.',
    status: 'ready',
    previewKey: 'ds-avatar-image-fallback',
    code: `<script setup lang="ts">
import { DsAvatar } from '@feugene/granularity'

const avatarSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none"><rect width="96" height="96" rx="24" fill="#dbeafe" /><circle cx="48" cy="36" r="13" fill="#2563eb" /><path d="M18 80c6-15 18-23 30-23s24 8 30 23" fill="#2563eb" opacity="0.26" /></svg>')
const avatarImageSrc = 'data:image/svg+xml;charset=UTF-8,' + avatarSvg
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <DsAvatar :size="40" :src="avatarImageSrc" alt="Alex Doe" />
    <DsAvatar :size="56" :src="avatarImageSrc" alt="Alex Doe" />
    <DsAvatar :size="72" shape="square">QA</DsAvatar>
  </div>
</template>`,
  },
  {
    id: 'avatar-team-row',
    title: 'Composition inside user or team rows',
    description: 'На практике `DsAvatar` почти всегда живёт рядом с именем, ролью и secondary text — поэтому документируем и такой composed layout.',
    status: 'ready',
    previewKey: 'ds-avatar-team-row',
    code: `<script setup lang="ts">
import { DsAvatar, DsCard } from '@feugene/granularity'
</script>

<template>
  <DsCard class="flex items-center gap-3 p-4">
    <DsAvatar :size="44">AD</DsAvatar>
    <div>
      <div class="text-sm font-semibold">Alex Doe</div>
      <div class="text-sm text-[var(--muted-fg)]">Engineering lead</div>
    </div>
  </DsCard>
</template>`,
  },
]
